/**
 * @file app.js
 * @fileoverview The main module of the program, contains several access
 * namespaces denoting which functions, arrays, enums, and variables may be
 * returned for external or global usage. Begun 09/22/18
 * @author Andrew Eissen
 * @external three.min.js
 */
'use strict';

/* global THREE */

/**
 * @description The primary namespace module, containing a pair of access
 * namespaces that determine whether or not external invocation is permitted or
 * prohibited. Almost all functions, arrays, enums, and variables are included
 * in the <code>inaccessible</code> object namespace, with only the function
 * <code>accessible.init</code> externally available for invocation by outside
 * functions. These namespaces are supposed to both limit access and simulate
 * the access keywords <code>public</code> and <code>private</code> in Java. As
 * they are prepended to the function signatures and names of arrays in the body
 * of the module, they intentionally bring to mind these keywords and alert the
 * user as to what functions are externally available and which are private in
 * much the same way.
 * <br />
 * <br />
 * Contained within the <code>inaccessible</code> object namespace are all the
 * application logic functions, utility functions, handlers, and assorted enums
 * and arrays of objects containing and processing the data required to display
 * both the <code>canvas</code>-mediated scene and the resultant interface
 * sidebar. HTML is mostly generated dynamically within this module rather than
 * hardcoded directly into the HTML file itself, unlike the approach taken in
 * the Project 3 template file. This decision was made to permit easier
 * configuration and development changes in the event of an interface design
 * alteration without having to modify both the JS file and the HTML file.
 * <br />
 * <br />
 * <pre>
 * Table of contents
 * - Enums
 *   - Utility                    Line 0091
 *   - Identifiers                Line 0131
 *   - Text                       Line 0161
 *   - Colors                     Line 0183
 * - Source data
 *   - elementIdNumbersInUse      Line 0206
 *   - sceneElementData           Line 0228
 *   - sceneLightData             Line 0361
 *   - sidebarButtonData          Line 0407
 * - Function groups
 *   - Utility functions          Line 0430
 *   - Handlers                   Line 0600
 *   - Assembly functions         Line 0969
 *   - init                       Line 1492
 * </pre>
 *
 * @see {@link //google.github.io/styleguide/javascriptguide.xml|Styleguide #2}
 * @author Andrew Eissen
 * @module ProjectThreeModule
 * @const
 */
const ProjectThreeModule = (function () {

  // Declare access namespaces (basically public and private)
  let accessible, inaccessible;

  // Define access namespaces
  accessible = accessible || {};
  inaccessible = inaccessible || {};

  /**
   * @description This constant is used to test the program and display messages
   * in the console. Though not a part of the <code>inaccessible</code> object,
   * it is still contained within the private restricted scope of the
   * <code>ProjectThreeModule</code> IIFE and cannot be accessed externally.
   * @const
   */
  const DEBUG = false;

  /**
   * @description Enum for assorted utility constants. Herein are set assorted
   * default camera settings, renderer settings, and assorted helper constants
   * required in various contexts. These values were moved from their previous
   * in-function placements to assist in ease of adjustment if a value needs to
   * be changed universally for all elements or functions making use of that
   * value. Object is made immutable via <code>Object.freeze</code>.
   *
   * @readonly
   * @enum {number}
   */
  inaccessible.Utility = Object.freeze({

    // setInterval values
    TESTING_INTERVAL: 1600,
    FADE_IN_INTERVAL: 10,

    // Opacity
    OPACITY_INCREASE_AMOUNT: 0.015,

    // Canvas
    CANVAS_WIDTH: 640,
    CANVAS_HEIGHT: 480,

    // Camera
    Z_AXIS_CAMERA_POSITION: 25,
    CAMERA_FOV: 45,
    FRUSTRUM_NEAR_PLANE: 1,
    FRUSTRUM_FAR_PLANE: 100,

    // Transformation operations
    ANIMATION_INCREMENT: 0.01,
    ROTATION_INCREMENT: 0.03,
    SCALE_INCREMENT: 0.01,
    TRANSLATE_INCREMENT: 0.1,
    DEFAULT_ROTATION_COORDINATES: [0.4, -0.2, 0],
    DEFAULT_SCALE_COORDINATES: [1, 1, 1],
    DEFAULT_TRANSLATION_COORDINATES: [0, -1.5, 0],
  });

  /**
   * @description This enum is used to store the <code>String</code>
   * representations of the various DOM element ids and class names present in
   * the interface. This enum is useful in assisting the process of grabbing
   * elements in the DOM via <code>document.getElementById</code> in multiple
   * places, allowing the user to adjust these names as needed without having to
   * sift through all the application logic functions below for each appearance.
   *
   * @readonly
   * @enum {string}
   */
  inaccessible.Identifiers = Object.freeze({
    CONTAINER_ID: 'container',
    CONTAINER_MODULE: 'container-module',
    SIDEBAR_ID: 'interface-sidebar',
    SIDEBAR_MODULE_CLASS: 'sidebar-module',
    SIDEBAR_ELEMENT_CLASS: 'sidebar-element',
    CANVAS_HOLDER_ID: 'canvas-holder',
    CANVAS_ID: 'glcanvas',
    FORM_ID: 'toggle-button-holder',
    HEADER_CLASS: 'header-text',
    CHECKBOX_CLASS: 'toggle-button',
    LABEL_CLASS: 'toggle-button-label',
    BUTTON_CLASS: 'action-button',
    BUTTON_HOLDER_ID: 'button-holder',
  });

  /**
   * @description This enum is used to store all the text <code>String</code>s
   * used in the display of popup <code>window.alert</code>s or error messages
   * to be appended to the main container element, as well as the text nodes of
   * button or checkbox elements. As per the Google styleguide's section on
   * "Template literals," template literal strings spanning multiple lines do
   * not have to follow the indentation of the enclosing block. As such, these
   * strings rather messily break the indentation of the enum. The author is
   * sorry for this ugliness, but since string literals may not span multiple
   * lines, he has no choice but to use template literals here.
   *
   * @readonly
   * @enum {string}
   */
  inaccessible.Text = Object.freeze({
    LABEL: 'Toggle',
    CHECKBOXES_HEADER: 'Animation display options',
    BUTTON_HOLDER_HEADER: 'Interaction buttons',
    WEBGL_ERROR: 'Sorry, WebGL is required but is not available.',
    START_BUTTON_ERROR: `Animation is already running.`,
    STOP_BUTTON_ERROR: `Animation is not currently running.`,
    KEYSTROKE_INFO: `Use arrow keys, PgUp, and PgDn to rotate scene
Use E and R to adjust scale/zoom
Use W, A, S, D, Z, and X to translate scene`,
  });

  /**
   * @description This readonly enum contains the various color types and their
   * associated hexadecimal values for use in coloring the scene objects and
   * light sources preset in the scene. Many of these hues were inspired by the
   * similar colors used to shade the elements in the author's Project 2
   * submission.
   *
   * @readonly
   * @enum {number}
   */
  inaccessible.Colors = Object.freeze({
    DARKGRAY: 0x101010,
    GRAY: 0x444444,
    LIGHTGRAY: 0x808080,
    BLACK: 0x000000,
    WHITE: 0xFFFFFF,
    RED: 0xFF0000,
    GREEN: 0x00FF00,
    BLUE: 0x0000FF,
    BROWN: 0xD2691E,
    SALMON: 0xFF8300,
    CHARTREUSE: 0x7FFF00,
    MAGENTA: 0xFF00FF,
    DODGERBLUE: 0x1E90FF,
  });

  /**
   * @description This array is use to store reserved numbers in use for naming
   * checkbox and label ids. As element ids and thus their component numbers
   * cannot be used twice, <code>inaccessible.getRandomNumberForId</code>, the
   * number generation function, must check this array to see if the number
   * created is already in use.
   */
  inaccessible.elementIdNumbersInUse = [];

  /**
   * @description This array of objects is used to store all the data related to
   * the types of objects to be assembled and added to the <code>canvas</code>
   * scene. Everything from basic transforms to be applied to color types and
   * mesh material to shininess levels is contained in here to allow users to
   * easily adjust elements as needed without having to sort through the various
   * assembly and handler functions below to adjust a single aspect.
   * <br />
   * <br />
   * These particular scene objects, six in total per the rubric requirements,
   * possess mesh materials of both the <code>MeshPhongMaterial</code> and
   * <code>MeshLambertMaterial</code> varieties, with the appropriate shininess
   * and specular aspects applied to the former to give shine to certain objects
   * as needed. The box (floor) and torus ring are styled with the latter, while
   * the four other objects are styled with the former with various degrees of
   * glitteriness. The author had these objects rotate in such a way as to make
   * the shiniest objects, the sphere and icosahedron, actually pass through the
   * torus without clipping, like a ball through a hoop. The author still thinks
   * it's pretty neat to see.
   */
  inaccessible.sceneElementData = [
    {
      itemType: 'Box',
      isAnimated: true,
      meshMaterial: 'MeshLambertMaterial',
      colorType: inaccessible.Colors.BROWN,
      shininess: null,
      specular: null,
      geometry: 'BoxGeometry',
      geometryConfig: [5, .5, 5],
      positionCoords: [0, 0, 0],
      rotateCoords: null,
      transformations: [
        {
          rotationAxis: 'y',
          rotationAmount: inaccessible.Utility.ANIMATION_INCREMENT
        },
      ],
    },
    {
      itemType: 'Dodecahedron',
      isAnimated: true,
      meshMaterial: 'MeshPhongMaterial',
      colorType: inaccessible.Colors.SALMON,
      shininess: 50,
      specular: inaccessible.Colors.DARKGRAY,
      geometry: 'DodecahedronGeometry',
      geometryConfig: [1, 0],
      positionCoords: [0, 0, -7],
      rotateCoords: null,
      transformations: [
        {
          rotationAxis: 'x',
          rotationAmount: inaccessible.Utility.ANIMATION_INCREMENT
        },
      ],
    },
    {
      itemType: 'Icosahedron',
      isAnimated: true,
      meshMaterial: 'MeshPhongMaterial',
      colorType: inaccessible.Colors.CHARTREUSE,
      shininess: 30,
      specular: inaccessible.Colors.LIGHTGRAY,
      geometry: 'IcosahedronGeometry',
      geometryConfig: [1, 0],
      positionCoords: [7, 0, 0],
      rotateCoords: null,
      transformations: [
        {
          rotationAxis: 'z',
          rotationAmount: inaccessible.Utility.ANIMATION_INCREMENT * 2
        },
      ],
    },
    {
      itemType: 'Octohedron',
      isAnimated: true,
      meshMaterial: 'MeshPhongMaterial',
      colorType: inaccessible.Colors.MAGENTA,
      shininess: 50,
      specular: inaccessible.Colors.DARKGRAY,
      geometry: 'OctahedronGeometry',
      geometryConfig: [1, 0],
      positionCoords: [0, 0, 7],
      rotateCoords: null,
      transformations: [
        {
          rotationAxis: 'x',
          rotationAmount: inaccessible.Utility.ANIMATION_INCREMENT
        },
      ],
    },
    {
      itemType: 'Sphere',
      isAnimated: true,
      meshMaterial: 'MeshPhongMaterial',
      colorType: inaccessible.Colors.WHITE,
      shininess: 30,
      specular: inaccessible.Colors.LIGHTGRAY,
      geometry: 'SphereGeometry',
      geometryConfig: [1, 32, 32],
      positionCoords: [-7, 0, 0],
      rotateCoords: null,
      transformations: [
        {
          rotationAxis: 'z',
          rotationAmount: inaccessible.Utility.ANIMATION_INCREMENT * 2
        },
      ],
    },
    {
      itemType: 'Torus',
      isAnimated: true,
      meshMaterial: 'MeshLambertMaterial',
      colorType: inaccessible.Colors.DODGERBLUE,
      shininess: null,
      specular: null,
      geometry: 'TorusGeometry',
      geometryConfig: [1.6, 0.4, 6, 100, 6.3],
      positionCoords: [0, 7, 0],
      rotateCoords: null,
      transformations: [
        {
          rotationAxis: 'x',
          rotationAmount: inaccessible.Utility.ANIMATION_INCREMENT
        },
        {
          rotationAxis: 'z',
          rotationAmount: inaccessible.Utility.ANIMATION_INCREMENT
        },
      ],
    },
  ];

  /**
   * @description Like the similar array of objects above, this array of objects
   * contains all data related to a certain type of <code>canvas</code> scene
   * component, namely the light sources. Included in each relevant object are
   * properties related to the colors of the lights, their initial positions,
   * and their levels of intensity. To allow users to adjust lights more easily,
   * these elements were collected together in an array to remove the need to
   * trudge through the application logic in order to adjust a single aspect.
   * <br />
   * <br />
   * The light placements were tested courtesy of the shiny, super reflective
   * sphere scene object, which denotes on its surface via reflections the
   * placements of the five lights. The brightest light, green, was put in the
   * least effective placement, namely above the scene at the +1 y-axis position
   * while the red and blue lights were provided a slight boost to their
   * intensities to match the brightness of the green. The viewpoint light was
   * placed at the camera and the global light slightly above that.
   */
  inaccessible.sceneLightData = [
    {
      itemType: 'RedLight',
      isAnimated: true,
      positionArray: [1, 0, 0],
      lightColor: inaccessible.Colors.RED,
      intensity: .35
    },
    {
      itemType: 'GreenLight',
      isAnimated: true,
      positionArray: [0, 1, 0],
      lightColor: inaccessible.Colors.GREEN,
      intensity: .25
    },
    {
      itemType: 'BlueLight',
      isAnimated: true,
      positionArray: [-1, 0 , 0],
      lightColor: inaccessible.Colors.BLUE,
      intensity: .35
    },
    {
      itemType: 'ViewpointLight',
      isAnimated: true,
      positionArray: [0, 0, 1],
      lightColor: inaccessible.Colors.WHITE,
      intensity: .15
    },
    {
      itemType: 'GlobalLight',
      isAnimated: true,
      positionArray:[0, 50, 50],
      lightColor: inaccessible.Colors.WHITE,
      intensity: .15
    },
  ];

  /**
   * @description This array of objects is used to store data pertaining to the
   * types of interface buttons to be appended to the sidebar. Contained in each
   * object are properties related to name, <code>String</code> representation
   * of the event listener handler function signature associated with that
   * button, and a set of potential arguments to pass as parameters to that
   * function.
   */
  inaccessible.sidebarButtonData = [
    {
      buttonType: 'About',
      functionName: 'handleInfoDisplay',
      functionArguments: []
    },
    {
      buttonType: 'Start animation',
      functionName: 'handleAnimationStart',
      functionArguments: []
    },
    {
      buttonType: 'Stop animation',
      functionName: 'handleAnimationStop',
      functionArguments: []
    },
    {
      buttonType: 'Reset model',
      functionName: 'handleSettingOfDefaultTransforms',
      functionArguments: []
    },
  ];

  // Utility functions

  /**
   * @description Like <code>inaccessible.prepend</code>, this function is based
   * on jQuery's <code>$().append()</code> function used to add a DOM element
   * to another based on a <code>String</code> representation of the container's
   * id or class name.
   *
   * @param {string} paramTarget
   * @param {string} paramSubject
   * @returns {void}
   */
  inaccessible.append = function (paramTarget, paramSubject) {
    document.getElementById(paramTarget).appendChild(paramSubject);
  };

  /**
   * @description Like <code>inaccessible.append</code>, this function is based
   * on jQuery's <code>$().prepend()</code> function used to add a DOM element
   * to another based on a <code>String</code> representation of the container's
   * id or class name.
   *
   * @param {string} paramTarget
   * @param {string} paramSubject
   * @returns {void}
   */
  inaccessible.prepend = function (paramTarget, paramSubject) {
    document.getElementById(paramTarget).insertBefore(paramSubject,
        paramTarget.firstChild);
  };

  /**
   * @description This function returns a <code>boolean</code> value based on
   * whether or not the inputted object is an array. It is used by
   * <code>inaccessible.assembleElement</code> to determine if inputted
   * parameters need to be formatted as arrays.
   *
   * @param {object} paramTarget
   * @returns {boolean}
   */
  inaccessible.isArray = function (paramTarget) {
    return Object.prototype.toString.call(paramTarget) === '[object Array]';
  };

  /**
   * @description This utility function is used to remove any half-assembled
   * element content stored within a certain inputted DOM element. It is used
   * as a precautionary measure within the <code>catch</code> part of
   * <code>inaccessible.main</code>'s try...catch block to clear the container
   * node prior to the appending of an error message in the event of an error.
   *
   * @see {@link https://stackoverflow.com/a/3450726|Relevant SO Thread}
   * @param {string} paramElementId
   * @returns {void}
   */
  inaccessible.emptyElementOfContent = function (paramElementId) {

    // Declaration
    let element;

    // Definition
    element = document.getElementById(paramElementId);

    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  };

  /**
   * @description This helper function is used to generate an integer that lies
   * between the input parameter values of <code>paramMin</code> and
   * <code>paramMax</code>, a value which is returned and appended to the
   * checkbox element id name to provide an artificial unique identifier for
   * that element in the event of there being multiple instances of the same
   * shape type. If the generated value already exists in the id number array at
   * <code>inaccessible.elementIdNumbersInUse</code>, the function recursively
   * calls itself again with the same parameters until a unique number is
   * generated.
   * <br />
   * <br />
   * Admittedly this approach makes styling individual elements via their ids
   * difficult as the id will change with each run of the program, but since the
   * author had not built the program with user-defined CSS in mind, this issue
   * was not a major concern. All that mattered was that multiple instances of
   * the same shape type be permitted in the scene without multiples of the ids
   * existing in the DOM.
   *
   * @param {integer} paramMin
   * @param {integer} paramMax
   * @returns {integer} number
   */
  inaccessible.getRandomNumberForId = function (paramMin, paramMax) {

    // Declarations
    let number, inUseArray;

    // Definition
    number = Math.floor(Math.random() * (paramMax - paramMin + 1)) + paramMin;
    inUseArray = this.elementIdNumbersInUse;

    // If the number's in the array already
    if (inUseArray.indexOf(number) !== -1) {
      if (DEBUG) {
        console.warn(`${number} already in array`);
      }

      // Prevent endless recursion if no more available numbers can be created
      if (inUseArray.length !== (paramMax - paramMin + 1)) {
        this.getRandomNumberForId(paramMin, paramMax);
      }
    } else {
      inUseArray.push(number);

      if (DEBUG) {
        console.log(`${number} added`);
        console.log(inUseArray);
      }

      return number;
    }
  };

  /**
   * @description This function is based on the similarly-named fading function
   * available by default in jQuery. As the scene is set to an opacity style
   * value of 0 from the start (namely in its bulk assembly function
   * <code>inaccessible.assembleBodyFramework</code>), this function simply
   * increases the element's opacity until it reaches a value of 1, thus giving
   * the impression of the scene fading in from the start. This helps hide the
   * often jerky scene and interface assembly sequence from view for a few
   * milliseconds.
   *
   * @param {string} paramElementId
   * @returns {void}
   */
  inaccessible.fadeIn = function (paramElementId) {

    // Declarations
    let that, container, interval;

    // Definitions
    that = this;
    container = document.getElementById(paramElementId);
    interval = setInterval(function () {
      if (container.style.opacity < 1) {
        container.style.opacity = (parseFloat(container.style.opacity) +
            that.Utility.OPACITY_INCREASE_AMOUNT);
      } else {
        if (DEBUG) {
          console.log('Scene fade-in complete');
        }

        clearInterval(interval);
        return;
      }
    }, this.Utility.FADE_IN_INTERVAL);
  };

  /**
   * @description Taken from the the contents of the default Project 3 template
   * file, this method is used to render the scene with the newly applied
   * transformations in play. It is similar to the <code>repaint</code> method
   * called after transformations in the author's Project 2 OpenGL submission.
   *
   * @returns {void}
   */
  inaccessible.render = function () {
    this.renderer.render(this.scene, this.camera);
  };

  // Handlers

  /**
   * @description One of two checkbox listener handlers, this function simply
   * sets the negated value of the <code>isAnimated</code> <code>boolean</code>
   * object property as the property itself, like a toggle function of sorts.
   *
   * @param {object} paramObject
   * @returns {void}
   */
  inaccessible.handleSceneElementCheckboxChanges = function (paramObject) {
    paramObject.isAnimated = !paramObject.isAnimated;
  };

  /**
   * @description The second of the two checkbox event listener handlers, this
   * function negates the <code>isAnimated</code> <code>boolean</code> property
   * and switches on or off the light accordingly.
   * <br />
   * <br />
   * Originally, this toggling functionality was undertaken by setting the
   * <code>boolean</code> value of <code>isAnimated</code> as the value of
   * <code>THREE.DirectionalLight.visible</code> as per the appropriate
   * <code>Object3D</code> property. However, clicks of the approriate toggle
   * button in the GUI resulted in seconds-spanning wait times in which the
   * entire window was frozen for reasons not fully understood to the author. As
   * a hacky workaround, the author just decided to change the light color to
   * black on toggle, which resulted in faster render times which didn't block
   * the entire program for long durations.
   *
   * @param {object} paramObject
   * @returns {void}
   */
  inaccessible.handleLightSourceCheckboxChanges = function (paramObject) {
    paramObject.isAnimated = !paramObject.isAnimated;

    // This approach is just too slow for some reason
    //paramObject.assembledLight.visible = paramObject.isAnimated;

    // Alternate approach simply adjusts off light color to black
    if (!paramObject.isAnimated) {
      paramObject.assembledLight.color.set(this.Colors.BLACK);
    } else {
      paramObject.assembledLight.color.set(paramObject.lightColor);
    }

    // Save render for an unanimated scene
    if (!this.isSceneAnimated) {
      this.render();
    }
  };

  /**
   * @description In lieu of a status log (which the author debated adding but
   * decided against due to a lack of space and logical placement), the program
   * displays a <code>window.alert</code> popup informing the user of what keys
   * perform what actions. Originally, the author wanted to add a personalized
   * modal like the ones in Bootstrap.js or those available in jQuery, but
   * ultimately was unable to find the time or energy to do so.
   *
   * @returns {void}
   */
  inaccessible.handleInfoDisplay = function () {
    window.alert(this.Text.KEYSTROKE_INFO);
  };

  /**
   * @description This function handles presses of the "Start animation" button,
   * setting the object-global <code>inaccessible.isSceneAnimated</code> value
   * to <code>true</code> and calling <code>inaccessible.handleFrame</code> as
   * per the Project 3 template file example. If the animation is running and
   * the button is pressed again, a <code>window.alert</code> popup is displayed
   * to inform the user of the animation's current status.
   *
   * @returns {void}
   */
  inaccessible.handleAnimationStart = function () {
    if (!this.isSceneAnimated) {
      this.isSceneAnimated = true;

      // Run the testing animation if unit testing is in progress
      if (DEBUG) {
        this.handleAnimationTesting();
      } else {
        // Like P3 template's doFrame
        this.handleFrame();
      }
    } else {
      window.alert(this.Text.START_BUTTON_ERROR);
    }
  };

  /**
   * @description This function is like that above it,
   * <code>inaccessible.handleAnimationStart</code>, in that it simply sets the
   * object-global <code>inaccessible.isSceneAnimated</code> and displays a
   * <code>window.alert</code> popup if the button is pressed and the animation
   * is not running.
   *
   * @returns {void}
   */
  inaccessible.handleAnimationStop = function () {
    if (this.isSceneAnimated) {
      this.isSceneAnimated = false;
    } else {
      alert(this.Text.STOP_BUTTON_ERROR);
    }
  };

  /**
   * @description This function is the main testing function of the program,
   * based on the similar method in the author's Project 2 submission, namely
   * <code>ScenePanel.runAnimation</code>. As with that method, this function is
   * used to allow the author to storyboard the transformations along the x, y,
   * and z-axes as denoted below before running the test, after which the
   * expected results can be compared to the observed results. This particular
   * function is only run when the <code>DEBUG</code> global flag is set to a
   * value of <code>true</code>, with the main animation handler of
   * <code>inaccessible.handleFrame</code> called in normal cases of presses of
   * the "Start animation" button.
   * <br />
   * <br />
   * Like the aforementioned testing method in Project 2, this method runs
   * through a set of six (6) animations over a predetermined interval (as with
   * that method, 1600 milliseconds per animation), with the transformations
   * tested similar in type to those in the previously mentioned test method.
   *
   * @returns {void}
   */
  inaccessible.handleAnimationTesting = function () {

    // Declarations
    let that, interval, counter, amount;

    // Definitions
    that = this;
    counter = 1;
    amount = 0;
    this.isSceneAnimated = true;
    interval = setInterval(function () {
      if (!that.isSceneAnimated) {
        console.log('Animation complete');
        that.handleSettingOfDefaultTransforms();
        clearInterval(interval);
        return;
      }

      switch (counter) {
        case 1:
          amount = -0.45;
          that.model.rotation.y += amount;
          console.log('Rotate scene on y-axis by ' + amount);
          break;
        case 2:
          amount = 0.30;
          that.model.rotation.x += amount;
          console.log('Rotate scene on x-axis by ' + amount);
          break;
        case 3:
          amount = 0.2;
          that.model.scale.x += amount;
          that.model.scale.y += amount;
          that.model.scale.z += amount;
          console.log('Scale scene by ' + amount);
          break;
        case 4:
          amount = 0.75;
          that.model.rotation.y += amount;
          console.log('Rotate scene on y-axis by ' + amount);
          break;
        case 5:
          amount = -2;
          that.model.position.x += amount;
          console.log('Translate scene on x-axis by ' + amount);
          break;
        case 6:
          amount = -0.25;
          that.model.scale.x += amount;
          that.model.scale.y += amount;
          that.model.scale.z += amount;
          console.log('Scale scene by ' + amount);
          break;
        default:
          console.log('Resetting scene');
          counter = 0;
          that.handleSettingOfDefaultTransforms();
          break;
      }

      that.render();
      counter++;
    }, this.Utility.TESTING_INTERVAL);
  };

  /**
   * @description Making heavy usage of the author's beloved spread operator,
   * this function is used by several others to reset or set the scene to the
   * default transformation values denoted in the appropriate
   * <code>inaccessible.Utility</code> enum. It is based on a similar method
   * found in the author's previous Project 2 submission entry.
   * <br />
   * <br />
   * The function is called from within the bodies of the functions
   * <code>inaccessible.assembleScene</code> and
   * <code>inaccessible.handleAnimationTesting</code>, as well as on clicks of
   * the "Reset model" button.
   *
   * @returns {void}
   */
  inaccessible.handleSettingOfDefaultTransforms = function () {
    this.model.rotation.set(...this.Utility.DEFAULT_ROTATION_COORDINATES);
    this.model.scale.set(...this.Utility.DEFAULT_SCALE_COORDINATES);
    this.model.position.set(...this.Utility.DEFAULT_TRANSLATION_COORDINATES);

    if (!this.isSceneAnimated) {
      this.render();
    }
  };

  /**
   * @description This function was simply taken from the default function made
   * available in the Project 3 template HTML file, therein called
   * <code>doFrame</code>. It checks if the animation is running, and calls the
   * frame handler and render functions if so before calling itself recursively
   * until the scene is no longer animated.
   *
   * @see modeling-starter.doFrame
   * @returns {void}
   */
  inaccessible.handleFrame = function () {
    if (this.isSceneAnimated) {
      this.handleFrameUpdate();
      this.render();
      window.requestAnimationFrame(this.handleFrame.bind(this));
    }
  };

  /**
   * @description Like the function above, this function was also lifted from
   * the Project 3 template HTML file, though it was subsequently expanded to
   * allow for easier manipulation. Whereas before all animated elements were
   * rotated along the y-axis exclusively, this implementation allows for scene
   * element objects to notate in an array a list of axis-based rotations to be
   * undertaken per frame, allowing for more variety in animated movement. The
   * only thing that bugs the author is the nested loops. He hates nested loops
   * as a matter of principle. So ugly.
   *
   * @see modeling-starter.updateForFrame
   * @returns {void}
   */
  inaccessible.handleFrameUpdate = function () {

    // For every scene element...
    this.sceneElementData.forEach(function (entry) {

      // If the user hasn't toggled the element off...
      if (entry.isAnimated) {

        // We take each of its preset rotations from its transformation array
        entry.transformations.forEach(function (transformation) {

          // And apply it to the object along the selected axis
          entry.object.rotation[transformation.rotationAxis] +=
              transformation.rotationAmount;
        });
      }
    });
  };

  /**
   * @description Much of this function's contents were derived from the similar
   * <code>switch</code>-mediated method in his Project 2 submission, namely,
   * <code>ScenePanel.SceneKeyListener.keyPressed</code>. As with that method,
   * this function permits the user to interact with the scene via either
   * rotation, scale, or translation transformation operations, meditated via
   * the use of the W, A, S, D, Z, X, E, R, PgUp, PgDn, and arrow keys. Assuming
   * the key pressed was a legitimate, supported keystroke, the scene is
   * re-rendered to display the modifications undertaken.
   * <br />
   * <br />
   * In addition to sharing some similarities with the author's Project 2
   * submission method mentioned above, this function also shares some basic
   * functionality with the related <code>doKey</code> function contained in the
   * Project 3 template file, <code>modeling-starter.html</code>.
   *
   * @see modeling-starter.doKey
   * @param {event} paramEvent
   * @returns {void}
   */
  inaccessible.handleKeyPress = function (paramEvent) {

    // Declaration
    let isTransformed;

    switch (paramEvent.keyCode) {
      case 37: // Left arrow
        this.model.rotation.y -= this.Utility.ROTATION_INCREMENT;
        isTransformed = true;
        break;
      case 39: // Right arrow
        this.model.rotation.y += this.Utility.ROTATION_INCREMENT;
        isTransformed = true;
        break;
      case 38: // Up arrow
        this.model.rotation.x -= this.Utility.ROTATION_INCREMENT;
        isTransformed = true;
        break;
      case 40: // Down arrow
        this.model.rotation.x += this.Utility.ROTATION_INCREMENT;
        isTransformed = true;
        break;
      case 33: // PgUp
        this.model.rotation.z -= this.Utility.ROTATION_INCREMENT;
        isTransformed = true;
        break;
      case 34: // PgDowm
        this.model.rotation.z += this.Utility.ROTATION_INCREMENT;
        isTransformed = true;
        break;
      case 87: // W
        this.model.position.y += this.Utility.TRANSLATE_INCREMENT;
        isTransformed = true;
        break;
      case 83: // S
        this.model.position.y -= this.Utility.TRANSLATE_INCREMENT;
        isTransformed = true;
        break;
      case 65: // A
        this.model.position.x -= this.Utility.TRANSLATE_INCREMENT;
        isTransformed = true;
        break;
      case 68: // D
        this.model.position.x += this.Utility.TRANSLATE_INCREMENT;
        isTransformed = true;
        break;
      case 88: // X
        this.model.position.z += this.Utility.TRANSLATE_INCREMENT;
        isTransformed = true;
        break;
      case 90: // Z
        this.model.position.z -= this.Utility.TRANSLATE_INCREMENT;
        isTransformed = true;
        break;
      case 82: // R
        this.model.scale.x += this.Utility.SCALE_INCREMENT;
        this.model.scale.y += this.Utility.SCALE_INCREMENT;
        this.model.scale.z += this.Utility.SCALE_INCREMENT;
        isTransformed = true;
        break;
      case 69: // E
        this.model.scale.x -= this.Utility.SCALE_INCREMENT;
        this.model.scale.y -= this.Utility.SCALE_INCREMENT;
        this.model.scale.z -= this.Utility.SCALE_INCREMENT;
        isTransformed = true;
        break;
      default:
        isTransformed = false;
        break;
    }

    if (isTransformed) {
      paramEvent.preventDefault();

      if (!this.isSceneAnimated) {
        this.render();
      }
    }
  };

  // Assembly functions

  /**
   * @description As with all the assembly functions, this function is used to
   * construct an individual instance of an element or object; in this case,it
   * builds a single HTML element that will be returned from the function and
   * appended to the DOM dynamically. It accepts an array of strings denoting
   * the type of element to create and also handles potentially nested element
   * arrays for elements that are to exist inside the outer element tags as
   * inner HTML.
   * <br />
   * <br />
   * This method was borrowed and slightly modified from a StackOverflow thread
   * response found <a href="https://stackoverflow.com/a/2947012">here</a>. Link
   * is provided in jsdoc style below but doesn't work as expected in NetBeans
   * despite being of the proper form.
   *
   * @see {@link https://stackoverflow.com/a/2947012|SO Thread}
   * @param {!Array<string>} paramArray
   * @returns {HTMLElement} element
   */
  inaccessible.assembleElement = function (paramArray) {

    // Declarations
    let element, name, attributes, counter, content;

    if (!this.isArray(paramArray)) {
      return this.assembleElement.call(this,
          Array.prototype.slice.call(arguments));
    }

    // Definitions
    name = paramArray[0];
    attributes = paramArray[1];
    element = document.createElement(name);
    counter = 1;

    // attributes != null -> attributes === undefined || attributes === null
    if (typeof attributes === 'object' && attributes != null &&
        !this.isArray(attributes)) {
      for (let attribute in attributes) {
        element.setAttribute(attribute, attributes[attribute]);
      }
      counter = 2;
    }

    for (let i = counter; i < paramArray.length; i++) {
      if (this.isArray(paramArray[i])) {
        content = this.assembleElement(paramArray[i]);
      } else {
         content = document.createTextNode(paramArray[i]);
      }

      element.appendChild(content);
    }

    return element;
  };

  /**
   * @description This assembly function is used to create and add a new light
   * source element to the scene. It is called from within the scene creation
   * function, <code>inaccessible.assembleScene</code>, via its use in
   * <code>inaccessible.assembleElementsAndCheckboxes</code>. It simply
   * assembles a new <code>THREE.DirectionalLight</code> instance, making use of
   * the parameters provided in the inputted <code>paramObject</code>.
   * <br />
   * <br />
   * Originally, the <code>paramObject</codE> also contained a
   * <code>String</code> representation of the individual light source's light
   * type, with options ranging from <code>DirectionalLight</code> to
   * <code>AmbientLight</code>. However, this was eventually simplified to
   * reduce the total number of moving parts in the scene. The use of the
   * <code>DirectionalLight</code> was sufficient for the author's purposes.
   *
   * @param {object} paramObject
   * @returns {void}
   */
  inaccessible.assembleLightSource = function (paramObject) {

    // Declarations
    let newLightSource, tempColor, tempIntensity;

    // Definitions
    tempColor = paramObject.lightColor;
    tempIntensity = paramObject.intensity;

    // Create new DirectionalLight
    newLightSource = new THREE.DirectionalLight(tempColor, tempIntensity);

    // Place at specified position
    newLightSource.position.set(...paramObject.positionArray);

    // Add to object for future toggling-mediated recoloring purposes
    paramObject.assembledLight = newLightSource;

    // Add to scene
    this.scene.add(newLightSource);
  };

  /**
   * @description This assembly method is responsible for creating new objects
   * in the scene. Taking the properties of the associated object contained in
   * <code>inaccessible.sceneElementData</code>, this function assembles a new
   * mesh and object node from a constructed mesh material and associated
   * geoemtry, adding those two new items as properties of the scene element
   * object. The mesh is <em>not</em> added to the object node in this method
   * however; that is done in the body of
   * <code>inaccessible.assembleScene</code> instead for added readability,
   * though it could be easily done in this function as well.
   * <br />
   * <br />
   * It is also worth noting that this function makes intentional use of the
   * so-called "weak comparison operator," that is <code>==</code> and its
   * negation <code>!=</code>. Unlike Java and other languages, JavaScript has
   * both a strong and weak comparison operator set, with the weak operators to
   * be avoided in most cases. In this case though, the negated operator
   * <code>!=</code> is used to allow the function to check for both undefined
   * and null behavior simultaneously while still permitting the possibility of
   * a ReferenceError being thrown. This is conventional practice among JS
   * developers as it is more succinct than the longer equivalent expression
   * <code>variable === undefined || variable === null</code>.
   *
   * @see {@link https://dorey.github.io/JavaScript-Equality-Table/|JET}
   * @param {object} paramObject
   * @returns {void}
   */
  inaccessible.assembleSceneElement = function (paramObject) {

    // Declarations
    let newGeometry, newMesh, newMeshMaterial, newObject, config, tempShininess,
      tempSpecular, tempGeometry, tempGeometryConfig, tempMeshMaterial,
      tempPositionCoords, tempRotateCoords;

    // Temp definitions
    tempShininess = paramObject.shininess;
    tempSpecular = paramObject.specular;
    tempGeometry = paramObject.geometry;
    tempGeometryConfig = paramObject.geometryConfig;
    tempMeshMaterial = paramObject.meshMaterial;
    tempPositionCoords = paramObject.positionCoords;
    tempRotateCoords = paramObject.rotateCoords;

    // Definition of mesh material
    config = {
      color: paramObject.colorType
    };

    // Equal to tempShininess === undefined || tempShininess === null
    if (tempShininess != null) {
      config.shininess = tempShininess;
    }

    // Equal to tempSpecular === undefined || tempSpecular === null
    if (tempSpecular != null) {
      config.specular = tempSpecular;
    }

    // Create geometry type, passing config array as arguments
    newGeometry = new THREE[tempGeometry](...tempGeometryConfig);

    // Create new mesh material
    newMeshMaterial = new THREE[tempMeshMaterial](config);

    // Create new object node
    newObject = new THREE.Object3D();

    // Define mesh given geometry and material assembled above
    newMesh = new THREE.Mesh(newGeometry, newMeshMaterial);

    // Equal to tempPositionCoords === undefined || tempPositionCoords === null
    if (tempPositionCoords != null && tempPositionCoords.length === 3) {
      newMesh.position.set(...tempPositionCoords);
    }

    // Equal to tempRotateCoords === undefined || tempRotateCoords === null
    if (tempRotateCoords != null && tempRotateCoords.length === 3) {
      newMesh.rotation.set(...tempRotateCoords);
    }

    // Add mesh and object node as object properties to be added together later
    paramObject.mesh = newMesh;
    paramObject.object = newObject;
  };

  /**
   * @description This function is responsible for assembling each of the
   * interface checkbox elements used to toggle the animation of various scene
   * components visible in the <code>canvas</code>. Each light source and scene
   * object has its own checkbox (and own label) in the sidebar, styled like a
   * <code>JToggleButton</code> depending on its clicked/changed state. Each
   * element has its own unique id consisting of its name with an appended
   * randomly generated integer to permit the addition of multiple instances of
   * a single shape type to the interface without the risk of multiple ids
   * existing in the sidebar.
   *
   * @param {object} paramObject
   * @param {string} paramListener Representation of handler signature
   * @returns {void}
   */
  inaccessible.assembleCheckBoxElement = function (paramObject, paramListener) {

    // Declarations
    let that, checkBoxListElement, checkBoxConfig, labelConfig, elementId,
      tempName, numberId, aliasIds;

    // Preserve scope context
    that = this;

    // Splits at capital letters for better wording (i.e. RedLight -> Red Light)
    tempName = paramObject.itemType.split(/(?=[A-Z])/).join(' ');

    // Unique id in case of multiples of same object type
    numberId = this.getRandomNumberForId(0, 50);

    // Template literal for element id, i.e. #toggleTorus15
    elementId = `toggle${tempName}${numberId}`;

    // Styleguide permits aliasing enums, see styleguide #2 linked above
    aliasIds = this.Identifiers;

    // Checkbox properties
    checkBoxConfig = {
      type: 'checkbox',
      id: elementId,
      class: this.Identifiers.CHECKBOX_CLASS,
      name: elementId,
      checked: paramObject.isAnimated,
    };

    // Label properties
    labelConfig = {
      for: elementId,
      id: `${elementId}-label`,
      class: `${aliasIds.LABEL_CLASS} ${aliasIds.SIDEBAR_ELEMENT_CLASS}`,
    };

    // Creates <input> and <label> elements inside a <div> container
    checkBoxListElement = this.assembleElement(['div', {},
        ['input', checkBoxConfig, ''],
        ['label', labelConfig, `${this.Text.LABEL} ${tempName}`]]);

    // Add <div> container to <form> container/holder/wrapper/thingie
    this.append(aliasIds.FORM_ID, checkBoxListElement);

    // Add toggle listener, passing object reference as argument
    document.getElementById(elementId).addEventListener('change', function () {
      that[paramListener](paramObject);
    }, false);
  };

  /**
   * @description This function, like
   * <code>inaccessible.assembleCheckBoxElement</code> above it, is used to
   * build button elements to be used to trigger certain events in the interface
   * on click. However, it is simplified in some respects; as it unlikely that
   * multiple instances of the same button will be added to the interface, no
   * unique id containing a randomly generated number has been created. Instead,
   * only the button name with a prepended "button" is used to create the id.
   *
   * @param {object} paramObject
   * @returns {void}
   */
  inaccessible.assembleButtonElement = function (paramObject) {

    // Declarations
    let that, elementId, tempName, buttonConfig, buttonElement, aliasIds;

    // Definitions
    that = this;
    tempName = paramObject.buttonType;
    elementId = `button${tempName}`;

    // Styleguide permits aliasing enums, see styleguide #2 linked above
    aliasIds = this.Identifiers;

    // Button properties
    buttonConfig = {
      id: elementId,
      class: `${aliasIds.BUTTON_CLASS} ${aliasIds.SIDEBAR_ELEMENT_CLASS}`,
    };

    // <button> inside <div> wrapper
    buttonElement = this.assembleElement(['div', {},
        ['button', buttonConfig, tempName]]);

    // Add to button module
    this.append(aliasIds.BUTTON_HOLDER_ID, buttonElement);

    document.getElementById(elementId).addEventListener('click', function () {
      that[paramObject.functionName](...paramObject.functionArguments);
    }, false);
  };

  /**
   * @description This function makes significant use of the DOM element builder
   * <code>inaccessible.assembleElement</code>'s recursive functionality to
   * construct many levels of nested elements. This function mainly just fills
   * the otherwise empty <code>body</code> tag with a container wrapper
   * <code>div</code>, a set of sidebar containers for checkboxes and buttons,
   * and a <code>div</code> wrapper for the <code>canvas</code> itself. It is
   * to these DOM nodes that the rest of the elements are assembled dynamically
   * and added to the wrapper.
   *
   * @returns {void}
   */
  inaccessible.assembleBodyFramework = function () {

    let container, canvasHolder, sidebarInterface, aliasIds;

    // Styleguide permits aliasing enums, see styleguide #2 linked above
    aliasIds = this.Identifiers;

    // Container wrapper and config
    container = this.assembleElement(['div', {id: aliasIds.CONTAINER_ID}, '']);
    container.style.opacity = 0;

    // Left-hand sidebar
    sidebarInterface = this.assembleElement(

      // Sidebar container
      ['div', {id: aliasIds.SIDEBAR_ID, class: aliasIds.CONTAINER_MODULE},

      // Checkbox module container
      ['form', {id: aliasIds.FORM_ID, class: aliasIds.SIDEBAR_MODULE_CLASS},

      // Checkbox module header
      ['div', {class: aliasIds.HEADER_CLASS}, this.Text.CHECKBOXES_HEADER]],

      // Button module container
      ['div', {id: aliasIds.BUTTON_HOLDER_ID,
          class: aliasIds.SIDEBAR_MODULE_CLASS},

      // Button module header
      ['div', {class: aliasIds.HEADER_CLASS}, this.Text.BUTTON_HOLDER_HEADER]]]
    );

    // Wrapper for the canvas scene
    canvasHolder = this.assembleElement(['div',
        {id: aliasIds.CANVAS_HOLDER_ID, class: aliasIds.CONTAINER_MODULE}, '']);

    // Add container to empty body tag
    document.body.appendChild(container);

    // Add sidebar to left hand side
    this.append(aliasIds.CONTAINER_ID, sidebarInterface);

    // Add canvas to center-right
    this.append(aliasIds.CONTAINER_ID, canvasHolder);
  };

  /**
   * @description This builder utility function simply takes one of the
   * <code>inaccessible</code> arrays of objects and iterates over its contents,
   * passing each object entry to the assembly method responsible for creating
   * the in-scene element (either light or shape) and its associated sidebar
   * checkbox DOM element used to toggle its animation or display.
   *
   * @param {!Array<object>} paramDataSource
   * @param {string} paramAssemblyFunction Representation of assembly function
   *    signature
   * @param {string} listenerName Representation of listener function signature
   * @returns {void}
   */
  inaccessible.assembleElementsAndCheckboxes = function (paramDataSource,
      paramAssemblyFunction, listenerName) {

    // Declaration
    let that;

    // Definition
    that = this;

    // Builds both a checkbox element and a scene element/light source
    this[paramDataSource].forEach(function (entry) {
      that[paramAssemblyFunction](entry);
      that.assembleCheckBoxElement(entry, listenerName);
    });
  };

  /**
   * @description This assembly function was built to consolidate all the major
   * elements of the program previously contained in the body of
   * <code>inaccessible.main</code> and assemble them in a logical fashion,
   * making it easier to see at a glance what is being built and configured. The
   * config objects themselves are placed in temporary variables to make it
   * easier to view and adjust their individual properties.
   *
   * @returns {void}
   */
  inaccessible.assembleMajorComponents = function () {

    // Declarations
    let canvasConfig, rendererConfig, cameraConfig;

    // Canvas (canvas wrapper should have already been built)
    canvasConfig = {
      id: this.Identifiers.CANVAS_ID,
      width: this.Utility.CANVAS_WIDTH,
      height: this.Utility.CANVAS_HEIGHT,
    };
    this.canvas = this.assembleElement(['canvas', canvasConfig, '']);
    this.append(this.Identifiers.CANVAS_HOLDER_ID, this.canvas);

    // Renderer
    rendererConfig = {
      canvas: this.canvas,
      antialias: true,
    };
    this.renderer = new THREE.WebGLRenderer(rendererConfig);
    this.renderer.setClearColor(this.Colors.GRAY);

    // Camera
    cameraConfig = [
      this.Utility.CAMERA_FOV,
      4/3, // Aspect ratio for 640:480 as per rubric
      this.Utility.FRUSTRUM_NEAR_PLANE,
      this.Utility.FRUSTRUM_FAR_PLANE,
    ];
    this.camera = new THREE.PerspectiveCamera(...cameraConfig);
    this.camera.position.z = this.Utility.Z_AXIS_CAMERA_POSITION;

    // Other element initializations
    this.scene = new THREE.Scene();
    this.model = new THREE.Object3D();
  };

  /**
   * @description This function, originally a member of the Project 3 template
   * file named <code>createWorld</code>, is used to assemble all the elements
   * related to the <code>canvas</code>-mediated scene, building each light
   * source and scene object and their associated sidebar checkboxes, setting
   * the keystroke event listener, assembling the assorted buttons, and finally
   * adding the meshes to their associated <code>Object3D</code> node thingies.
   * The completed model is then added to the scene.
   *
   * @see modeling-starter.createWorld
   * @returns {void}
   */
  inaccessible.assembleScene = function () {

    // Declaration
    let that;

    // Definition
    that = this;

    // Build all six shapes and their checkboxes
    this.assembleElementsAndCheckboxes('sceneElementData',
        'assembleSceneElement', 'handleSceneElementCheckboxChanges');

    // Build light sources and their checkboxes
    this.assembleElementsAndCheckboxes('sceneLightData', 'assembleLightSource',
        'handleLightSourceCheckboxChanges');

    // Set keystroke handler
    document.addEventListener('keydown', this.handleKeyPress.bind(this), false);

    // Build all sidebar buttons used to manipulate program
    this.sidebarButtonData.forEach(function (button) {
      that.assembleButtonElement(button);
    });

    // Add meshes to object nodes for each shape entry, then add node to model
    this.sceneElementData.forEach(function (entry) {
      entry.object.add(entry.mesh);
      that.model.add(entry.object);
    });

    // Set default transforms to scene
    this.handleSettingOfDefaultTransforms();

    // Add model to scene
    this.scene.add(this.model);
  };

  /**
   * @description This function was based on the Project 3 template file's main
   * <code>init</code> function, used to define important objects and begin the
   * rendering and display process. As the name "init" was reserved for the sole
   * external-facing function <code>accessible.init</code> called by the body
   * on completion of DOM load, the refactored function was thus renamed to
   * "main."
   *
   * @see modeling-starter.init
   * @returns {void}
   */
  inaccessible.main = function () {

    try {

      // Dynamically assemble HTML skeleton framework in body
      this.assembleBodyFramework();

      // Define Camera, Scene, Renderer, etc.
      this.assembleMajorComponents();

      // Set object-global boolean property related to animation running
      this.isSceneAnimated = false;

      // Build lights/objects, checkboxes, buttons; add meshes to nodes, etc.
      this.assembleScene();

      // Repaint and render scene
      this.render();

    } catch (e) {
      if (DEBUG) {
        console.warn(e);
      }

      // Remove any half-assembled content from container wrapper
      this.emptyElementOfContent(this.Identifiers.CONTAINER_ID);

      // Add an error message to container (from template file)
      this.append(this.Identifiers.CONTAINER_ID, this.assembleElement(['h3',
          ['b', this.Text.WEBGL_ERROR]]));
    }

    // Regardless of the success/error status, we fade in on assembled GUI
    this.fadeIn(this.Identifiers.CONTAINER_ID);
  };

  // init

  /**
   * The sole function of the <code>accessible</code> access scope object
   * namespace, <code>init</code> is called on the completion of the loading
   * of the HTML <code>body</code> element. This method is the only externally
   * accessible function or variable of the <code>ProjectThreeModule</code>
   * module, and simply calls <code>inaccessible.main</code> to get the program
   * started.
   *
   * @returns {void}
   */
  accessible.init = function () {
    inaccessible.main();
  };

  // Allow external access to accessible object namespace ("public")
  return accessible;
})();
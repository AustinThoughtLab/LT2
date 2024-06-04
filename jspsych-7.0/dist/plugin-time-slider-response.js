var jsPsychTimeSliderResponse = (function (jspsych) {
    'use strict';

    const info = {
        name: "time-slider-response",
        parameters: {
            /** The image to be displayed */
            stimulus: {
                type: jspsych.ParameterType.IMAGE,
                pretty_name: "Stimulus",
                default: undefined,
            },
            /** Set the image height in pixels */
            stimulus_height: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Image height",
                default: null,
            },
            /** Set the image width in pixels */
            stimulus_width: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Image width",
                default: null,
            },
            /** Maintain the aspect ratio after setting width or height */
            maintain_aspect_ratio: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Maintain aspect ratio",
                default: true,
            },
            /** Sets the minimum value of the slider. */
            min: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Min slider",
                default: 0,
            },
            /** Sets the maximum value of the slider */
            max: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Max slider",
                default: 100,
            },
            /** Sets the starting value of the slider */
            slider_start: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Slider starting value",
                default: 50,
            },
            /** Sets the step of the slider */
            step: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Step",
                default: 1,
            },
            /** Array containing the labels for the slider. Labels will be displayed at equidistant locations along the slider. */
            labels: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Labels",
                default: [],
                array: true,
            },
            /** Width of the slider in pixels. */
            slider_width: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Slider width",
                default: null,
            },
            slider_number: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: 'Slider with number',
                default: false,
                description: 'Include a number with the selected value in the slider.'
            },
            /** Label of the button to display. */
            button_label_1: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Button label 1",
                default: "Submit",
                array: false,
            },
            /** Label of the button to advance. */
            button_label_2: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Button label 2",
                default: "Continue",
                array: false,
            },
            /** If true, the participant will have to move the slider before continuing. */
            require_movement: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Require movement",
                default: false,
            },
            /** Any content here will be displayed below the slider. */
            prompt: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Prompt",
                default: null,
            },
            /** How long to show the stimulus. */
            stimulus_duration: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Stimulus duration",
                default: null,
            },
            /** How long to show the trial. */
            trial_duration: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Trial duration",
                default: null,
            },
            /** If true, trial will end when user makes a response. */
            response_ends_trial: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Response ends trial",
                default: true,
            },
            /**
             * If true, the image will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).
             * If false, the image will be shown via an img element.
             */
            render_on_canvas: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Render on canvas",
                default: true,
            },
            feedback_correct: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Feedback Correct",
                default: null,
                description: 'Feedback for correct response'
            },
            feedback_display: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Display Feedback?",
                default: true,
                description: 'Display feedback for correct response'
            },
        },
    };

    /**
     * **time-slider-response**
     *
     * jsPsych plugin for showing an image stimulus and getting a slider response
     *
     * @author Josh de Leeuw
     * @see {@link https://www.jspsych.org/plugins/plugin-time-slider-response/ time-slider-response plugin documentation on jspsych.org}
     */
     class TimeSliderResponsePlugin {
     constructor(jsPsych) {
         this.jsPsych = jsPsych;
     }
     trial(display_element, trial) {
         var height, width;

         // Calculate midpoint
         var midpoint = (trial.max + trial.min) / 2;

         // Set slider_start to midpoint
         trial.slider_start = midpoint;

         var html;
         // half of the thumb width value from jspsych.css, used to adjust the label positions
         var half_thumb_width = 7.5;
         if (trial.render_on_canvas) {
             var image_drawn = false;
             // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
             if (display_element.hasChildNodes()) {
                 // can't loop through child list because the list will be modified by .removeChild()
                 while (display_element.firstChild) {
                     display_element.removeChild(display_element.firstChild);
                 }
             }
             // create wrapper div, canvas element and image
             var content_wrapper = document.createElement("div");
             content_wrapper.id = "plugin-time-slider-response-wrapper";
             content_wrapper.style.marginTop = "20px"; // margin above the wrapper
             content_wrapper.style.marginBottom = "70px"; // margin below the wrapper
             var canvas = document.createElement("canvas");
             canvas.id = "plugin-time-slider-response-stimulus";
             canvas.style.margin = "0";
             canvas.style.padding = "0";
             var ctx = canvas.getContext("2d");
             // add prompt if there is one
             if (trial.prompt !== null) {
                 //display_element.innerHTML += trial.prompt;
                 display_element.insertAdjacentHTML("afterbegin", trial.prompt);
                 //display_element.insertBefore(content_wrapper, trial.prompt);
             }


             var img = new Image();
             img.onload = () => {
                 // if image wasn't preloaded, then it will need to be drawn whenever it finishes loading
                 if (!image_drawn) {
                     getHeightWidth(); // only possible to get width/height after image loads
                     ctx.drawImage(img, 0, 0, width, height);
                 }
             };
             img.src = trial.stimulus;
             // get/set image height and width - this can only be done after image loads because uses image's naturalWidth/naturalHeight properties
             const getHeightWidth = () => {
                 if (trial.stimulus_height !== null) {
                     height = trial.stimulus_height;
                     if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
                         width = img.naturalWidth * (trial.stimulus_height / img.naturalHeight);
                     }
                 } else {
                     height = img.naturalHeight;
                 }
                 if (trial.stimulus_width !== null) {
                     width = trial.stimulus_width;
                     if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
                         height = img.naturalHeight * (trial.stimulus_width / img.naturalWidth);
                     }
                 } else if (!(trial.stimulus_height !== null && trial.maintain_aspect_ratio)) {
                     // if stimulus width is null, only use the image's natural width if the width value wasn't set
                     // in the if statement above, based on a specified height and maintain_aspect_ratio = true
                     width = img.naturalWidth;
                 }
                 canvas.height = height;
                 canvas.width = width;
             };
             getHeightWidth(); // call now, in case image loads immediately (is cached)
             // create container with slider and labels
             var slider_container = document.createElement("div");
             slider_container.classList.add("plugin-time-slider-response-container");
             slider_container.style.position = "relative";
             slider_container.style.margin = "0 auto 3em auto";
             if (trial.slider_width !== null) {
                 slider_container.style.width = trial.slider_width.toString() + "px";
             }
             // create html string with slider and labels, and add to slider container
             html =
                 '<input type="range" class="jspsych-slider" value="' +
                 trial.slider_start +
                 '" min="' +
                 trial.min +
                 '" max="' +
                 trial.max +
                 '" step="' +
                 trial.step +
                 '" id="plugin-time-slider-response-response"  style="margin-top: 60px;"></input>';
             if (trial.slider_number) {
                 html += '<div id="your_id_here" style="position: absolute; top: 20px;">';
                 html += '<output id="output">' + trial.slider_start + '</output></div>';;
             }
             html += "<div>";
             html += '<div style="display: inline-block; position: absolute; left: 0; transform: translateX(-50%); text-align: center; width: 10%;">'; // Adjusted left and added transform
             var min_hour = Math.floor(trial.min/60)
             var min_m = "a.m."
             // Check if the number is 13 or greater
             if (min_hour >= 13) {
                 // Subtract 12 from the number
                 min_hour -= 12;
                 min_m = 'p.m.'
             }
             var min_minute_prep = trial.min%60;
             if (min_minute_prep <= 9) {
                 // Subtract 12 from the number
                 var min_minute = ('0'+min_minute_prep).toString();
             } else {
               var min_minute = min_minute_prep.toString()
             }
             html += '<span style="text-align: center; font-size: 80%;">'+min_hour.toString()+':'+min_minute.toString()+' '+min_m+'</span>';
             html += '</div>';
             html += '<div style="display: inline-block; position: absolute; right: 0; transform: translateX(50%); text-align: center; width: 10%;">'; // Adjusted right and added transform
             var max_hour = Math.floor(trial.max/60)
             var max_m = "a.m."
             // Check if the number is 13 or greater
             if (max_hour >= 13) {
                 // Subtract 12 from the number
                 max_hour -= 12;
                 max_m = 'p.m.'
             }
             var max_minute_prep = trial.max%60;
             if (max_minute_prep <= 9) {
                 // Subtract 12 from the number
                 var max_minute = ('0'+max_minute_prep).toString();
             } else {
               var max_minute = max_minute_prep.toString()
             }
             html += '<span style="text-align: center; font-size: 80%;">'+max_hour.toString()+':'+max_minute.toString()+' '+max_m+'</span>';
             html += '</div>';
             slider_container.innerHTML = html;

             // add canvas and slider to content wrapper div
             content_wrapper.insertBefore(canvas, content_wrapper.firstElementChild);
             content_wrapper.insertBefore(slider_container, canvas.nextElementSibling);
             // add content wrapper div to screen and draw image on canvas
             display_element.insertBefore(content_wrapper, null);
             if (img.complete && Number.isFinite(width) && Number.isFinite(height)) {
                 // if image has loaded and width/height have been set, then draw it now
                 // (don't rely on img onload function to draw image when image is in the cache, because that causes a delay in the image presentation)
                 ctx.drawImage(img, 0, 0, width, height);
                 image_drawn = true;
             }
             // add submit button
             var submit_btn = document.createElement("button");
             submit_btn.id = "plugin-time-slider-response-next";
             submit_btn.classList.add("jspsych-btn");
             submit_btn.disabled = trial.require_movement ? true : false;
             if (trial.feedback_display) {
               submit_btn.innerHTML = trial.button_label_1;
             } else {
               submit_btn.innerHTML = trial.button_label_2;
             }
             display_element.insertBefore(submit_btn, display_element.nextElementSibling);

             // Update slider position
             function updateSliderPosition() {
             var slider = display_element.querySelector('#plugin-time-slider-response-response');
             var output = display_element.querySelector('#output');
             var sliderValue = slider.value;
             console.log("sliderValue: ", sliderValue)
             var time_hour_prep = Math.floor(sliderValue/60)
             if (time_hour_prep >= 13) {
               var time_hour = (time_hour_prep-12).toString();
             } else {
               var time_hour = time_hour_prep.toString()
             }
             var time_minute_prep = Math.floor(sliderValue%60)
             if (time_minute_prep <= 9) {
                 // Subtract 12 from the number
                 var time_minute = ('0'+time_minute_prep).toString();
             } else {
               var time_minute = time_minute_prep.toString()
             }
             output.innerHTML = time_hour+":"+time_minute;
             var newPosition = ((sliderValue - trial.min) / (trial.max - trial.min)) * (slider.offsetWidth - output.offsetWidth);
             console.log("newPosition: ", newPosition)
             your_id_here.style.left = newPosition + 'px';
               //output.innerHTML = sliderValue;
             }

             // Call updateSliderPosition initially
             updateSliderPosition();

             // Define a function to calculate sliderWidth and outputWidth
             function calculateWidths() {
               var sliderWidth = display_element.querySelector('#plugin-time-slider-response-response').offsetWidth;
               var outputWidth = display_element.querySelector('#output').offsetWidth;
               return { sliderWidth: sliderWidth, outputWidth: outputWidth };
             }

             // Add event listener for input
             display_element.querySelector('#plugin-time-slider-response-response').addEventListener('input', function() {
               var sliderValue = this.value;
               var { sliderWidth, outputWidth } = calculateWidths(); // Destructure the object returned by calculateWidths
               var newPosition = ((sliderValue - trial.min) / (trial.max - trial.min)) * (sliderWidth - outputWidth);
               display_element.querySelector('#output').style.left = newPosition + 'px';
               display_element.querySelector('#output').innerHTML = sliderValue;
    updateSliderPosition();
             });

         } else {
             // Code for non-canvas rendering
         }
         var response = {
             rt: null,
             response: null,
         };
         if (trial.require_movement) {
             const enable_button = () => {
                 display_element.querySelector("#plugin-time-slider-response-next").disabled = false;
             };
             display_element
                 .querySelector("#plugin-time-slider-response-response")
                 .addEventListener("mousedown", enable_button);
             display_element
                 .querySelector("#plugin-time-slider-response-response")
                 .addEventListener("touchstart", enable_button);
             display_element
                 .querySelector("#plugin-time-slider-response-response")
                 .addEventListener("change", enable_button);
         }
         const end_trial = () => {
             this.jsPsych.pluginAPI.clearAllTimeouts();
             // save data
             var trialdata = {
                 rt: response.rt,
                 stimulus: trial.stimulus,
                 slider_start: trial.slider_start,
                 response: response.response,
             };
             display_element.innerHTML = "";
             // next trial
             this.jsPsych.finishTrial(trialdata);
         };

         // Add Variable to Track Button Clicks
         let buttonClickCount = 0;

         // Modify the event listener for button click to count clicks
         display_element
    .querySelector("#plugin-time-slider-response-next")
    .addEventListener("click", () => {
        if (buttonClickCount === 0) { // Check if button has not been clicked yet
            // Capture the response
            response.response = display_element.querySelector("#plugin-time-slider-response-response").valueAsNumber;
            // Measure the response time
            var endTime = performance.now();
            response.rt = Math.round(endTime - startTime);
            // Proceed to the next step
            buttonClickCount++;
            if(trial.feedback_display) {
            // Display feedback_correct
            displayFeedbackCorrect();
            }
            // Change button label to button_label_2
            display_element.querySelector("#plugin-time-slider-response-next").innerHTML = trial.button_label_2;
        } else if (buttonClickCount === 1) { // Check if button has been clicked once
            // Proceed with the trial completion
            if (trial.response_ends_trial) {
                end_trial();
            } else {
                display_element.querySelector("#plugin-time-slider-response-next").disabled = true;
            }
        }
                });

                // Function to display feedback_correct
function displayFeedbackCorrect() {
    var feedbackcorrect = document.createElement("div");
    //feedbackcorrect.innerHTML = trial.feedback_correct; // Assuming feedback_correct is HTML content

    var correct_hour_prep = Math.floor(trial.feedback_correct/60)
    if (correct_hour_prep >= 13) {
      var correct_hour = (correct_hour_prep-12).toString();
    } else {
      var correct_hour = correct_hour_prep.toString()
    }
    var correct_minute_prep = trial.feedback_correct%60
    if (correct_minute_prep <= 9) {
        // Subtract 12 from the number
        var correct_minute = ('0'+correct_minute_prep).toString();
    } else {
      var correct_minute = correct_minute_prep.toString()
    }




    feedbackcorrect.innerHTML = correct_hour+':'+correct_minute; // Assuming feedback_correct is HTML content

      // Calculate the horizontal position relative to the slider's width
      var sliderWidth = display_element.querySelector('#plugin-time-slider-response-response').offsetWidth;
      var outputWidth = display_element.querySelector('#output').offsetWidth;
      var horizontalPosition = (trial.feedback_correct - trial.min) / (trial.max - trial.min) * (sliderWidth - outputWidth) + 'px'; // Assuming trial.feedback_correct is in pixels

    // Adjust vertical position here
        feedbackcorrect.style.position = "absolute"; // Ensure positioning works as expected
        feedbackcorrect.style.top = "-5px"; // Adjust this value to change the vertical position
        feedbackcorrect.style.left = horizontalPosition;
        feedbackcorrect.style.color = "blue";

    slider_container.appendChild(feedbackcorrect);
}

            if (trial.stimulus_duration !== null) {
                this.jsPsych.pluginAPI.setTimeout(() => {
                    display_element.querySelector("#plugin-time-slider-response-stimulus").style.visibility = "hidden";
                }, trial.stimulus_duration);
            }
            // end trial if trial_duration is set
            if (trial.trial_duration !== null) {
                this.jsPsych.pluginAPI.setTimeout(() => {
                    end_trial();
                }, trial.trial_duration);
            }
            var startTime = performance.now();
        }
        simulate(trial, simulation_mode, simulation_options, load_callback) {
            if (simulation_mode == "data-only") {
                load_callback();
                this.simulate_data_only(trial, simulation_options);
            }
            if (simulation_mode == "visual") {
                this.simulate_visual(trial, simulation_options, load_callback);
            }
        }
        simulate_data_only(trial, simulation_options) {
            var trial_data = {
                rt: Math.floor(Math.random() * 1000),
                response: Math.floor(Math.random() * (trial.max - trial.min + 1) + trial.min),
                stimulus: trial.stimulus,
                slider_start: trial.slider_start,
            };
            this.jsPsych.finishTrial(trial_data);
        }
        simulate_visual(trial, simulation_options, load_callback) {
            var start_time = performance.now();
            var trial_complete = false;
            var trial_data = {};
            var html = '<div id="jspsych-time-slider-response-stimulus">';
            html += '<img src="' + trial.stimulus + '" id="jspsych-time-slider-response-stimulus"></img>';
            html += "</div>";
            html += '<div class="jspsych-content-wrapper">';
            html +=
                '<input type="range" value="' +
                trial.slider_start +
                '" min="' +
                trial.min +
                '" max="' +
                trial.max +
                '" step="' +
                trial.step +
                '" id="plugin-time-slider-response-response"></input>';
            html +=
                '<button id="jspsych-time-slider-response-next" class="jspsych-btn">' +
                trial.button_label_1 +
                "</button>";
            html += "</div>";
            display_element.innerHTML = html;
            if (trial.stimulus_duration !== null) {
                this.jsPsych.pluginAPI.setTimeout(() => {
                    display_element.querySelector("#jspsych-time-slider-response-stimulus").style.visibility = "hidden";
                }, trial.stimulus_duration);
            }
            display_element.querySelector("#jspsych-time-slider-response-next").addEventListener("click", () => {
                end_trial();
            });
            display_element.querySelector("#plugin-time-slider-response-response").addEventListener("change", () => {
                if (!trial_complete) {
                    trial_complete = true;
                    trial_data.rt = Math.round(performance.now() - start_time);
                    trial_data.response = display_element.querySelector("#plugin-time-slider-response-response").valueAsNumber;
                    trial_data.stimulus = trial.stimulus;
                    trial_data.slider_start = trial.slider_start;
                    end_trial();
                }
            });
            function end_trial() {
                if (trial.trial_duration !== null) {
                    trial_data.trial_duration = trial.trial_duration;
                }
                trial_complete = true;
                display_element.innerHTML = "";
                this.jsPsych.finishTrial(trial_data);
            }
        }
    }
    TimeSliderResponsePlugin.info = info;
    return TimeSliderResponsePlugin;
})(jsPsychModule);

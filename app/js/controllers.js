'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('GreenhousesListController', ['$scope', "appSettings",

        function($scope, appSettings) {
            /**
             * MQTT Initialization
             **/

            console.log(appSettings);

            var client = new Messaging.Client("ws://iot.eclipse.org/ws", "clientId");
            client.onConnectionLost = function(responseObject) {
                if (responseObject.errorCode !== 0) {
                    console.log("onConnectionLost:" + responseObject.errorMessage);
                    console.log("Reconnecting...")
                    client.connect({
                        onSuccess: function() {
                            client.subscribe(appSettings.topic_prefix + "+/actuators/#");
                        }
                    });
                }
            };

            client.onMessageArrived = function(message) {
                console.log(message);

                var topic = message.destinationName;
                var sensor = topic.substring(topic.lastIndexOf("/") + 1, topic.length);
                //console.log("SENSOR: " + sensor);
                if ($scope[sensor]) {
                    $scope[sensor].value = message.payloadString;
                    $scope[sensor].timestamp = dateFormat(new Date());
                    $scope.$apply();
                }
                //console.log("onMessageArrived: "+message.destinationName +": " +message.payloadString);
            };

            client.connect({
                onSuccess: function() {
                    $scope.addGreenhouse("benjamin");
                    $scope.addGreenhouse("maurice");
                    $scope.addGreenhouse("ian");
                    $scope.addGreenhouse("mike");
                    $scope.$apply();

                    client.subscribe(appSettings.topic_prefix + "+/actuators/#");
                }
            });


            $scope.greenhouses = [];

            $scope.addGreenhouse = function(name) {
                var greenhouse = {
                    name: name,
                    temperature: Math.floor((Math.random() * 10) + 20),
                    light: true,
                    refreshInterval: 2,
                };

                var publishTemperatureRegularly = function() {
                    if ("blink2" === greenhouse.pulse)
                        greenhouse.pulse = "blink";
                    else
                        greenhouse.pulse = "blink2";

                    var message = new Messaging.Message("" + greenhouse.temperature);
                    message.destinationName = appSettings.topic_prefix + greenhouse.name + "/temperature";
                    client.send(message);

                    greenhouse.timer = setTimeout(publishTemperatureRegularly, greenhouse.refreshInterval * 1000);

                    $scope.$apply();
                }

                publishTemperatureRegularly();

                $scope.greenhouses.push(greenhouse);
            };


        }
    ]);
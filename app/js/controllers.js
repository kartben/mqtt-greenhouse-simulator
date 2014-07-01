'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('GreenhousesListController', ['$scope', '$timeout', 'appSettings',

        function($scope, $timeout, appSettings) {
            /**
             * MQTT Initialization
             **/

            console.log(appSettings);

            var client = new Messaging.Client("ws://iot.eclipse.org/ws", "clientId");
            client.onConnectionLost = function(responseObject) {
                if (responseObject.errorCode !== 0) {
                    console.log("onConnectionLost:" + responseObject.errorMessage);
                    console.log("Reconnecting... [" + new Date() + "]");
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
                var topicFragments = topic.split('/');
                // topicFragments[0] == {appSetting.topic_prefix}
                // topicFragments[1] == {unique_id}
                // topicFragments[2] == "actuators"
                // topicFragments[3] == {actuatorName} (e.g. light)

                var uniqueId = topicFragments[1];
                var actuatorName = topicFragments[3];

                // find the greenhouse with name == uniqueId
                for (var i in $scope.greenhouses) {
                    var greenhouse = $scope.greenhouses[i];
                    if (greenhouse.name === uniqueId) {
                        greenhouse.lightState = (message.payloadString === "1" ? "on" : "off");
                        $scope.$apply();
                        break;
                    }
                }
            };

            client.connect({
                onSuccess: function() {
                    $scope.addGreenhouse("benjamin");
                    $scope.addGreenhouse("maurice");
                    // $scope.addGreenhouse("ian");
                    // $scope.addGreenhouse("mike");
                    // $scope.$apply();
                    client.subscribe(appSettings.topic_prefix + "+/actuators/#");
                }
            });

            $scope.greenhouses = [];

            $scope.addGreenhouse = function(name) {
                if (name === undefined) {
                    var name = '54:52:00';

                    for (var i = 0; i < 6; i++) {
                        if (i % 2 === 0) name += ':';
                        name += Math.floor(Math.random() * 16).toString(16);
                    }
                }

                var greenhouse = {
                    name: name,
                    temperature: Math.floor((Math.random() * 10) + 20),
                    //                    lightState: true,
                    refreshInterval: 2,
                };

                var publishTemperatureRegularly = function() {
                    if ("blink2" === greenhouse.pulse)
                        greenhouse.pulse = "blink";
                    else
                        greenhouse.pulse = "blink2";

                    var message = new Messaging.Message("" + greenhouse.temperature);
                    message.destinationName = appSettings.topic_prefix + greenhouse.name + "/sensors/temperature";
                    client.send(message);

                    greenhouse.timer = $timeout(publishTemperatureRegularly, greenhouse.refreshInterval * 1000);
                }

                publishTemperatureRegularly();

                $scope.greenhouses.push(greenhouse);
            };
        }
    ]);
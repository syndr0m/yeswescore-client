(function (Cordova, undefined) {
  /*#ifdef STRICT*/
  "use strict";
  /*#endif*/

  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var isGingerbread = /android 2\.3/i.test(userAgent);
  var isOldAndroid = /(android 2\.3|android 4\.0)/i.test(userAgent);  
  var isAndroid = /android/i.test(userAgent);   
  var isIOS = /(iPad|iPhone|iPod)/i.test(userAgent);
  var isWP8 = true;
  /*#ifndef WP8*/
  isWP8 = false;
  /*#endif*/
  // wrapper around cordova device 
  //  will be overrided by fake cordova in dev.
  var Device = {
    name: '',
    cordova: '',
    platform: '',
    uuid: '',
    version: '',
    model: '',
    // custom properties
    isGingerbread: isGingerbread,
    isIOS: isIOS,
    isAndroid : isAndroid,
    isOldAndroid : isOldAndroid,
    isWP8: isWP8
  };
  
  // registering geolocalisation only when cordova is ready.
  Cordova.deviceready(function () {
  
    if (typeof window.device !== "undefined") {
      Device.name     = window.device.name;
      Device.cordova  = window.device.cordova;
      Device.platform = window.device.platform;
      Device.uuid     = window.device.uuid;
      Device.version  = window.device.version;
      Device.model    = window.device.model;
    }  
  
    Cordova.Device = Device;
  
  });
})(Cordova);
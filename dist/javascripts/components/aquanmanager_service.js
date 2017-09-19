"use strict";window.define(["axios"],function(t){function i(t){o=this,o.extendOptions(t),o.init()}var o=null;return i.prototype={options:{},extend:function(t,i){for(var o in i)i.hasOwnProperty(o)&&(t[o]=i[o]);return t},extendOptions:function(t){this.options=this.extend({},this.options),this.extend(this.options,t)},init:function(){console.log("init")},getDeviceType:function(){return navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)?"ios":navigator.userAgent.match(/Android/i)?"android":navigator.userAgent.match(/Mac/i)?"mac":void 0},startPlayer:function(){var i=o.getDeviceType();t.get("/api/v1/aquaplayer",{params:{device:i,video:this.options.videoUrl,training_user_id:this.options.trainingUserId,course_id:this.options.courseId,course_list_id:this.options.courseListId,video_id:this.options.videoId,video_status:void 0!==this.options.videoStatus?this.options.videoStatus:"progress",total_played_seconds:void 0!==this.options.totalPlayedSeconds?this.options.totalPlayedSeconds:0}}).then(function(t){if("ios"===i){var o=(new Date).getTime();window.location.href=t.data.iosUrl,setTimeout(function(){setTimeout(function(){var t=(new Date).getTime();t-o<400&&(window.location.href="https://itunes.apple.com/kr/app/aquanmanager/id1048325731")},10)},300)}else"android"===i&&(window.location.href=t.data.androidUrl)}).catch(function(t){console.log(t)})}},i});
//# sourceMappingURL=../../maps/components/aquanmanager_service.js.map

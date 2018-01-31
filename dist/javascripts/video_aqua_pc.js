"use strict";window.requirejs(["common","aquaPlayerService","easyTimer","jqueryTimer"],function(e,n,t){function o(){v.setVolume(.5),v.bindEvent("Error",function(e,n){console.error(n)}),v.bindEvent("OpenStateChanged",function(e){switch(e){case window.NPlayer.OpenState.Opened:console.info("player: playing"),N=v.getDuration(),D<N-5&&window.confirm("마지막 재생시점으로 이동하시겠습니까?")&&v.setCurrentPlaybackTime(D),a();break;case window.NPlayer.OpenState.Closed:console.log("closed")}}),v.bindEvent("PlayStateChanged",function(e){switch(e){case window.NPlayer.PlayState.Playing:d(),T.reset(1e3*S);break;case window.NPlayer.PlayState.Stopped:case window.NPlayer.PlayState.Paused:console.info("player: stop/pause"),T.pause(),s()}}),v.bindEvent("PlaybackCompleted",function(){console.info("player: ended"),T.pause(),c(),s(),j||setTimeout(function(){m(".timer").removeClass("blind"),console.log("second timer started"),k.start({countdown:!0,startValues:{seconds:30}}),O.html(k.getTimeValues().toString()+" 초 이내 <b>다음</b> 버튼을 클릭해주세요."),k.addEventListener("secondsUpdated",function(e){O.html(k.getTimeValues().toString()+" 초 이내 <b>다음</b> 버튼을 클릭해주세요.")}),k.addEventListener("targetAchieved",function(e){O.html("학습 초기화 중입니다.."),setTimeout(function(){window.alert("30초 동안 다음 버튼을 누르지 않아 학습을 초기화 하였습니다.\n\n재시청 해주시기 바랍니다."),g.all([u(),f()]).then(g.spread(function(e,n){window.location.reload()}))},3e3)})},1e3)})}function a(){N?(T=m.timer(1e3*S,r,!0),T.stop(),i()):console.error("을 확인할 수 없습니다.")}function i(){c()}function r(){console.log("video played time logging..."),C+=S;var e=v.getCurrentPlaybackTime();if(p>0&&p===e)return v.pause(),void P.removeClass("blind");p=e,m.ajax({type:"POST",url:"/video/log/playtime",data:{training_user_id:L,video_id:q,played_seconds:C,video_duration:N,currenttime:e}}).done(function(e){e.success?(C=0,V=e.total_played_seconds,c()):(console.error(e.msg),v.pause().then(function(){}).catch(function(e){console.error(e)}))})}function s(){console.log("video log end"),m.ajax({type:"POST",url:"/video/log/endtime",data:{video_id:q}}).done(function(e){e.success||console.error(e.msg)})}function d(){m.ajax({type:"POST",url:"/session/log/starttime",data:{training_user_id:y.data("training-user-id"),course_id:y.data("course-id"),course_list_id:y.data("course-list-id")}}).done(function(e){e.success?j=e.hasEnded:(console.error(e.msg),T.stop(),v.stop())})}function l(){m.ajax({type:"POST",url:"/session/log/endtime",data:{training_user_id:y.data("training-user-id"),course_id:y.data("course-id"),course_list_id:y.data("course-list-id")}}).done(function(e){e.success?window.location.href=x:console.error(e.msg)})}function c(){Math.floor(N*(E/100))<=V&&(b.removeClass("blind"),P.addClass("blind"))}function u(){return g.delete("/video/log",{params:{video_id:y.data("id")}}).then(function(e){}).catch(function(e){console.error(e)})}function f(){return g.delete("/session/log",{params:{training_user_id:y.data("training-user-id"),course_list_id:y.data("course-list-id")}}).then(function(e){}).catch(function(e){console.error(e)})}var p,m=m||window.$,g=g||window.axios,w=e.getOSName(),v=null,y=m(".videoplayer"),_=m("#aqua-html5"),h=m("#aqua-window"),b=m("#btn_play_next"),P=m("#btn_replay_video"),S=y.data("interval"),T=null,C=0,k=new t,O=m("#countdown .values"),E=y.data("passive-rate"),j=!1,x=b.parent().attr("href"),N=null,q=y.data("id"),V=y.data("total-play"),D=y.data("current-time"),L=b.data("training-user-id");m(function(){var e={fileUrl:m("#video").data("url"),watermark:m("#video").data("watermark"),callback:function(e){e&&(v=e,o())}};n=new n(e),"Windows"===w?h.show():_.show()}),b.on("click",function(e){e.preventDefault(),k.stop(),l()}),P.on("click",function(e){e.preventDefault(),v.play(),P.addClass("blind")})});
//# sourceMappingURL=../maps/video_aqua_pc.js.map

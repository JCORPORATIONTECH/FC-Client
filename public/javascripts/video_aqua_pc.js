window.requirejs(
  [
    'common',
    'aquaPlayerService',
    'easyTimer',
    'jqueryTimer'
  ],
function (Util, AquaPlayerService, Timer) {
  var $ = $ || window.$;
  var axios = axios || window.axios;
  var osName = Util.getOSName();

  var player = null;
  var playerContainer = $('.videoplayer');
  var aquaHtml5 = $('#aqua_html5');
  var aquaWindow = $('#aqua_html5');
  var btnPlayNext = $('#btn_play_next');
  var btnReplayVideo = $('#btn_replay_video');

  var timerLoggingInterval = playerContainer.data('interval'); // log every 5 seconds
  var timerLog = null;
  var timerLogPlayedSeconds = 0; // 시청시간(초)
  var secondTimer = new Timer();

  var waitMessage = $('#countdown .values'); // $('.wait-message');
  var sessionHasEnded = false;
  var nextUrl = btnPlayNext.parent().attr('href');
  var videoDuration = null; // 비디오 러닝타임
  var videoCurrentTime; // 비디오 현재 시청시간
  var videoId = playerContainer.data('id'); // video 테이블의 id
  var videoTotalPlayedSeconds = playerContainer.data('total-play'); // 비디오 총 시청시간
  var videoLastPlayedTime = playerContainer.data('current-time'); // 마지막 재생시점
  var trainingUserId = btnPlayNext.data('training-user-id');

  $(function () {
    if (osName === 'Windows') {
      aquaHtml5.show();
    } else {
      aquaWindow.show();
    }

    var options = {
      fileUrl: $('#video').data('url'),
      watermark: $('#video').data('watermark'),
      callback: function (obj) {
        if (obj) {
          player = obj;
          initPlayer();
        }
      }
    };
    AquaPlayerService = new AquaPlayerService(options);
  });

  function initPlayer () {
    player.setVolume(0.5);

    if (videoLastPlayedTime < videoDuration - 5) {
      if (window.confirm('마지막 재생시점으로 이동하시겠습니까?')) {
        player.setCurrentPlaybackTime(videoLastPlayedTime).then(function (seconds) {
          player.pause();
        }).catch(function (error) {
          console.error(error);
        });
      }
    }

    player.bindEvent('Error', function (ec, msg) {
      console.error(msg);
    });

    player.bindEvent('PlayStateChanged', function (state) {
      switch (state) {
      case window.NPlayer.PlayState.Playing:
        console.info('player: playing');

        videoDuration = player.getDuration();
        setPlayer();

        // 세션시작로그
        sessionProgressStartLogger();

        // 로깅 시간간격 설정
        timerLog.reset(1000 * timerLoggingInterval);
        break;

      case window.NPlayer.PlayState.Stopped: // 정지
      case window.NPlayer.PlayState.Paused:  // 일시정지
        console.info('player: stop/pause');

        // 로깅 일시정지
        timerLog.pause();

        // 비디오 시청 종료일시 기록
        videoEndTimeLogger();
        break;
      }
    });

    player.bindEvent('PlaybackCompleted', function () {
      console.info('player: ended');

      // 로깅 일시정지
      timerLog.pause();

      // 총 시청시간에 따라 다음 버튼 표시
      showPlayBtn(videoTotalPlayedSeconds + timerLoggingInterval);

      // 비디오 시청 종료일시 기록
      videoEndTimeLogger();

      // 세션 종료 시 대기 타이머 시작
      if (!sessionHasEnded) {
        setTimeout(function () {
          $('.timer').removeClass('blind');

          console.log('second timer started');
          secondTimer.start({countdown: true, startValues: {seconds: 30}});

          waitMessage.html(secondTimer.getTimeValues().toString() + ' 초 이내 <b>다음</b> 버튼을 클릭해주세요.');

          secondTimer.addEventListener('secondsUpdated', function (e) {
            waitMessage.html(secondTimer.getTimeValues().toString() + ' 초 이내 <b>다음</b> 버튼을 클릭해주세요.');
          });

          secondTimer.addEventListener('targetAchieved', function (e) {
            waitMessage.html('학습 초기화 중입니다..');

            setTimeout(function () {
              window.alert('30초 동안 다음 버튼을 누르지 않아 학습을 초기화 하였습니다.\n\n재시청 해주시기 바랍니다.');

              axios.all([ deleteVideoLog(), deleteSessionLog() ])
              .then(axios.spread(function (res1, res2) {
                window.location.reload();
              }));
            }, 3000);
          });
        }, 1000);
      }
    });
  }

  /**
   * Player 를 셋팅한다.
   */
  function setPlayer () {
    if (videoDuration) {
      timerLog = $.timer(1000 * timerLoggingInterval, videoPlayTimeLogger, true);
      timerLog.stop();
      checkVideoDuration();
    } else {
      console.error('을 확인할 수 없습니다.');
    }
  }

  /**
   * 비디오 재생시간이 존재하는지 여부 체크
   */
  function checkVideoDuration () {
    // 총 릴타임의 80% 이상을 시청한 경우 다음버튼을 활성화 한다.
    showPlayBtn(videoTotalPlayedSeconds);
  }

    /**
   * 시청시간 로깅
   */
  function videoPlayTimeLogger () {
    console.log('logging...');
    timerLogPlayedSeconds += timerLoggingInterval;

    var seconds = player.getCurrentPlaybackTime();

    if ((videoCurrentTime > 0) && videoCurrentTime === seconds) {
      player.pause().then(function () {
        console.log('비디오가 중지되었습니다.');
        btnReplayVideo.removeClass('blind');
      }).catch(function (error) {
        console.error(error);
      });
      return;
    }

    videoCurrentTime = seconds;

    $.ajax({
      type: 'POST',
      url: '/video/log/playtime',
      data: {
        training_user_id: trainingUserId,
        video_id: videoId,
        played_seconds: timerLogPlayedSeconds,
        video_duration: videoDuration,
        currenttime: seconds
      }
    }).done(function (res) {
      if (!res.success) {
        console.error(res.msg);

        // 오류 발생 시 타이머와 비디오 재생을 멈춘다.
        player.pause().then(function () {
        }).catch(function (error) {
          console.error(error);
        });
      } else {
        timerLogPlayedSeconds = 0;
        // 총 릴타임의 80% 이상을 시청한 경우 다음버튼을 활성화 한다.
        videoTotalPlayedSeconds = res.total_played_seconds;
        showPlayBtn(videoTotalPlayedSeconds);
      }
    });
  }

  /**
   * 비디오 시청 종료시간 로깅
   */
  function videoEndTimeLogger () {
    console.log('video log end');
    $.ajax({
      type: 'POST',
      url: '/video/log/endtime',
      data: {
        video_id: videoId
      }
    }).done(function (res) {
      if (!res.success) {
        console.error(res.msg);
      } else {
      // console.info('종료시간 기록!');
      }
    });
  }

  /**
   * 세션 시작일시 로깅
   */
  function sessionProgressStartLogger () {
    $.ajax({
      type: 'POST',
      url: '/session/log/starttime',
      data: {
        training_user_id: playerContainer.data('training-user-id'),
        course_id: playerContainer.data('course-id'),
        course_list_id: playerContainer.data('course-list-id')
      }
    }).done(function (res) {
      if (!res.success) {
        console.error(res.msg);
      }
    });
  }

/**
 * 다음버튼 클릭 시 발생 이벤트
 */
  btnPlayNext.on('click', function (event) {
    event.preventDefault();
    secondTimer.stop();
    // 세션 종료로그를 기록한다.
    sessionProgressEndLogger();
  });

  /**
   * 세션 종료일시 로깅
   */
  function sessionProgressEndLogger () {
    $.ajax({
      type: 'POST',
      url: '/session/log/endtime',
      data: {
        training_user_id: playerContainer.data('training-user-id'),
        course_id: playerContainer.data('course-id'),
        course_list_id: playerContainer.data('course-list-id')
      }
    }).done(function (res) {
      if (!res.success) {
        console.error(res.msg);
      } else {
        window.location.href = nextUrl;
      }
    });
  }

  /**
   * 총 릴타임의 80% 이상을 시청한 경우 다음버튼을 활성화 한다.
   */
  function showPlayBtn () {
    if (playerContainer.data('status') === 'done') {
      btnPlayNext.removeClass('blind');
      btnReplayVideo.addClass('blind');
    }
  }

  /**
   * 세션 비디오 로그를 삭제한다.
   */
  function deleteVideoLog () {
    return axios.delete('/video/log', {
      params: {
        video_id: playerContainer.data('id')
      }
    })
    .then(function (response) {
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  // 세션 로그를 삭제한다.
  function deleteSessionLog () {
    return axios.delete('/session/log', {
      params: {
        training_user_id: playerContainer.data('training-user-id'),
        course_list_id: playerContainer.data('course-list-id')
      }
    })
    .then(function (response) {
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  // btnReplayVideo.on('click', function (e) {
  //   e.preventDefault();
  //   player.unload().then(function () {
  //     btnReplayVideo.addClass('blind');
  //   }).catch(function (error) {
  //     console.log(error);
  //   });
  // });
});

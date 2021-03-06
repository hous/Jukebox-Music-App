(function(w,d,$,_){

  var ViewControler={

    self:{},//self=this; 

    // buttons
    $play: $('.play'), //play button
    $previous: $('.rewind'),// previous button
    $next: $('.fastforward'),// next button
    $shuffle: $('.shuffle-container'),

    // store playListData;
    playListData:{},
    tracksKeys:[],
    tracksNames:[],
    tracksDurations:[],
    tracksSmallIcon:[],
    tracksAlbumNames:[],
    tracksArtists:[],
    trackKeysForCompare:[],
    soundIsPlaying:0,//which sound is playing
    isShuffle:false,
    isMusicPlaying:false,
    isFirstPlay:true,
    myScroll:{},
    maxSoundsNumberInPlaylisy:50,

    // set up the controls
    attachUIEventS: function(){ 
      //click Play button
      self.$play.click(self.playClickEventHandler);
      //click Previous button
      self.$previous.click(self.previousClickEventHandler);
      //click Next button
      self.$next.click(self.nextClickEventHandler);
      //click shuffle button
      self.$shuffle.click(self.shuffleClikcEventHandler);
    },

    shuffleClikcEventHandler: function(event) {
        self.isShuffle =! self.isShuffle;
        console.log('shuffle: '+self.isShuffle);
        if(self.isShuffle){
          self.$shuffle.removeClass('isShuffleOn')
          self.$shuffle.toggleClass('isShuffleOn');
        }else{
          self.$shuffle.removeClass('isShuffleOn');
        };
    },

    playClickEventHandler: function(){

      if(self.isMusicPlaying){
        //pauseMuisc
        self.pauseMusic();
        $(d).trigger('CHANGE_ISMUSICPLAYING_STATUS_EVENT',[false]);
      }else{
        //playMusic
        self.playMusic();
        $(d).trigger('CHANGE_ISMUSICPLAYING_STATUS_EVENT',[true]);
      };  
    },

    previousClickEventHandler: function() {
      if(self.soundIsPlaying > 0){
        $(d).trigger('CHANGE_ISMUSICPLAYING_STATUS_EVENT',[true]);
        //shuffle status on Previous control
        if(self.isShuffle){
          self.soundIsPlaying=_.random(0, (self.playListData[0].tracks.length-1));
          self.playMusic(self.tracksKeys[self.soundIsPlaying]); 
        }else{
          self.soundIsPlaying--;
          self.playMusic(self.tracksKeys[self.soundIsPlaying]);
        };   
      }; 
    },

    nextClickEventHandler: function() {
      if(self.soundIsPlaying < (self.playListData[0].tracks.length-1)){
        $(d).trigger('CHANGE_ISMUSICPLAYING_STATUS_EVENT',[true]);
        //shuffle status on Next control
        if(self.isShuffle){
          self.soundIsPlaying=_.random(0, (self.playListData[0].tracks.length-1));
          self.playMusic(self.tracksKeys[self.soundIsPlaying]); 
        }else{
          self.soundIsPlaying++;
          self.playMusic(self.tracksKeys[self.soundIsPlaying]);
        };
      }; 
    },

    playMusic: function(id){
      var orderNumber=self.soundIsPlaying == 0 ? 1 : self.soundIsPlaying;
      //play muisc by id
      $(d).trigger('PLAY_MUSIC_EVENT',[id]);
      //change the play icon in playlist in PlayListItem Module.
      $(d).trigger('CHANGE_PLAYLISTICON_EVENT',[self.soundIsPlaying]);
      self.autoIscroll();
    },

    pauseMusic: function(){
      $(d).trigger('PAUSE_MUSIC_EVENT');
    },

    renderPlaylist:function(soundIsPlaying, tracksKeys, tracksNames, tracksDurations, tracksSmallIcon, tracksAlbumNames, tracksArtists){
      $(d).trigger('PLAYLIST_RENDER_EVENT',[soundIsPlaying, tracksKeys, tracksNames, tracksDurations, tracksSmallIcon, tracksAlbumNames, tracksArtists]);
    },

    autoIscroll: function(){
      var orderNumber=self.soundIsPlaying == 0 ? 1 : self.soundIsPlaying;
      //iscroll auto scroll
      self.myScroll.scrollToElement(document.querySelector('.playlist-content li:nth-child('+orderNumber+')'));
    },

    bindDataEvents: function(){
      //run when music player loaded
      $(d).bind('PLAYER_DATA_LOADED_EVENT',self.playerLoadedEventHandler);
      //run everytime after get data from rdio api
      $(d).bind('RDIO_DATA_EVENT',self.rdioDataEventHandler);
      // get music position 
      $(d).bind('MUSIC_POSITION_DATA_EVENT', self.musicPositionEventHandler);
      //get soundisplaying number from PlaylistItem
      $(d).bind('CHANGE_SOUNDISPLAYING_EVENT', self.changeSoundisPlayingEventHandler);
      //get isMusicPlaying status from View and PlaylistItem
      $(d).bind('CHANGE_ISMUSICPLAYING_STATUS_EVENT', self.changeIsMuicPlayingStatusEventHandler);
      $(d).bind('INITIAL_ISCROLL_EVENT', self.initialIscrollEventHandler);
    },

    playerLoadedEventHandler: function() {
      console.log('playerLoaded');
    },

    rdioDataEventHandler: function(event,data){
      self.playListData=data;
      self.updataData();

      //play the music at the first time
      if(self.isFirstPlay){
        self.playMusic(self.tracksKeys[self.soundIsPlaying]);//first time play music in the playlist.
        $(d).trigger('CHANGE_ISMUSICPLAYING_STATUS_EVENT',[true]);
        self.isFirstPlay=false;
      }; 
    },

    initialIscrollEventHandler:function(){
      self.myScroll = new IScroll('#wrapper', { tap: true });
      document.addEventListener('touchmove', function (e) { }, false);
    },

    changeSoundisPlayingEventHandler:function(event, soundIsPlaying){
      self.soundIsPlaying=soundIsPlaying;
    },

    changeIsMuicPlayingStatusEventHandler:function(event, isMusicPlaying){
      self.isMusicPlaying=isMusicPlaying;
      //change the style of play button
      if(self.isMusicPlaying){
        self.$play.removeClass('isPlaying');
        self.$play.toggleClass('isPlaying');
      }else{
        self.$play.removeClass('isPlaying');
      };


    },

    musicPositionEventHandler: function(event, position){
      // when a music finished what we need to do: next sound/loop the play list/ shuffle
      if(position >= (self.tracksDurations[self.soundIsPlaying]-0.7/*-0.5*/)){
        //Shuffle
        if(self.isShuffle){
          //shuffle the playlist and play randomly
          self.soundIsPlaying=_.random(0, (self.playListData[0].tracks.length-1));
          self.playMusic(self.tracksKeys[self.soundIsPlaying]); 
        }else{
          if(self.soundIsPlaying == (self.playListData[0].tracks.length-1)){
            //loop after the playlist finish
            self.soundIsPlaying=0;
            self.playMusic(self.tracksKeys[self.soundIsPlaying]);
          }else{
            //play next music after one music finish
            self.soundIsPlaying++;
            self.playMusic(self.tracksKeys[self.soundIsPlaying]);
          };
        }; 
      };
    },
    
    //get tracksKeys,trackName, and tracksDurations information from data from rdio api and save them.
    updataData: function(){

      self.tracksKeys=[];
      self.tracksNames=[];
      self.tracksDurations=[];

      var i=0,
      length=self.playListData[0].tracks.length;
      for(i;i < length;i++){
        self.tracksKeys[i]=self.playListData[0].tracks[i].key;
        self.tracksNames[i]=self.playListData[0].tracks[i].name;
        self.tracksDurations[i]=self.playListData[0].tracks[i].duration;
        self.tracksSmallIcon[i]=self.playListData[0].tracks[i].icon;
        self.tracksAlbumNames[i]=self.playListData[0].tracks[i].album;
        self.tracksArtists[i]=self.playListData[0].tracks[i].artist;
      };

      self.playListCompare();
    },

    playListCompare: function(){
      var order;//order is the order number of the music which is playing on the screen
      if((self.trackKeysForCompare.toString()) != (self.tracksKeys.toString())){

          var newPlaylistLength=self.playListData[0].tracks.length;
          console.log(newPlaylistLength);
          if(newPlaylistLength>self.maxSoundsNumberInPlaylisy){
            //delete the music before the max naumber
            console.log('----delete----some music-----')
            var lengthToCleanUp=newPlaylistLength-self.maxSoundsNumberInPlaylisy;
            var tracksToDelete=[];
            var i=0;


            for(i; i < lengthToCleanUp; i++){
              tracksToDelete[i]=self.tracksKeys[i]
            };

            console.log(tracksToDelete);

            $.ajax({
              url : '/deletMusic',
              type : 'POST',
              dataType : 'json',
              data:{lengthToClean:lengthToCleanUp,tracks:tracksToDelete},
              success : function(res) {
                console.log('success delete music from server.js');
              }
            });

          }else{
            //ask renderPlaylist to render the playlist
            self.renderPlaylist(self.soundIsPlaying, self.tracksKeys, self.tracksNames, self.tracksDurations, self.tracksSmallIcon, self.tracksAlbumNames, self.tracksArtists);
            //do something after the playlist order changed or deleted some music 
            if((self.trackKeysForCompare.length) > 1){
              order=_.indexOf(self.tracksKeys, self.trackKeysForCompare[self.soundIsPlaying]);
              if(order >= 0){
                ///change the soundisPlaying when the order of playlist is changed.
                self.soundIsPlaying=order;
              }else{
                //a music is deleted
                self.playMusic(self.tracksKeys[self.soundIsPlaying]);
              };
            };
            $(d).trigger('CHANGE_PLAYLISTICON_EVENT',[self.soundIsPlaying]);
            self.autoIscroll();
              
          };

          
          self.trackKeysForCompare=self.tracksKeys;
      }else{
        return
      };
    },

    init: function() {
      self=this;
      self.attachUIEventS();
      self.bindDataEvents();
    }
  };

  window.addEventListener('DOMContentLoaded', ViewControler.init());

  

})(window, document, jQuery, _);
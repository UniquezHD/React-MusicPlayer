import '../css/Music.css'
import { useCookies } from 'react-cookie'
import { Redirect } from 'react-router-dom'
import App from './Home'
import React, { useState, useEffect, useRef } from 'react'

import axios from 'axios'

import io from 'socket.io-client'

import NoSleep from '@uriopass/nosleep.js';

import * as Io5Icons from 'react-icons/io5'
import * as BiIcons from 'react-icons/bi'
import * as CgIcons from 'react-icons/cg'
import * as GiIcons from 'react-icons/gi'
import * as ImIcons from 'react-icons/im'
import * as FaIcons from 'react-icons/fa'
import * as IoIcons from 'react-icons/io5'

var noSleep = new NoSleep();

/* TODO

Spil queue forfra loop

Fix play/pause btn
Fix sidste sang ikke kan ses i songs 
Fix at man kan skippe l;ngere frem og tilbage end der er sange
  
*/

let server
if (process.env.NODE_ENV !== 'production') {
  server = 'http://localhost:9004'
} else {
  server = xxxx
}

const socket = io(server)

function Audio() {

  const [cookies, setCookie, removeCookie] = useCookies(['user'])

  const [getMusic, setMusic] = useState(null)

  const [search, setSearch] = useState('<');

  const [searchQueue, setSearchQueue] = useState('<');

  const [queue, setQueue] = useState([],[])

  const [queueIndex, setQueueIndex] = useState(0)

  const [discordMode, setDiscordMode] = useState(true)

  const [getSongs, setSongs] = useState(null)

  const [isLooping, setIsLooping] = useState(false)

  const [isDiscoMode, setDiscoMode] = useState(false)

  const [searchMode, setSearchMode] = useState(true)

  useEffect(() => {

    socket.on('getCMD', (cmd, index) => {
      console.log(cmd, index)
      if(cmd === 'skip'){
        HandleNext()
      }
      else if(cmd == 'back'){
        HandleRewind()
      }
      else if(cmd == '!loop'){
        if(parseInt(index) === 0){
          setIsLooping(false)
        }
        else if (parseInt(index) == 1) {
          setIsLooping(true)
        }
      }
      else if(cmd == '!disco'){
        if(parseInt(index) === 0){
          setDiscoMode(false)
        }
        else if (parseInt(index) == 1) {
          setDiscoMode(true)
        }
      }
      else if(cmd == '!play'){
        if(parseInt(index)){
          if(parseInt(index) - 1 < 0) return
          if(parseInt(index) - 1 > queue.length - 1) return
          setQueueIndex(parseInt(index) - 1) 
        } else {
          console.log('naw')
        }
        
      }
      else if(cmd == '!volume'){
        if(parseFloat(index) > 1.0) return
        if(parseFloat(index) < 0.01) return
        try {
          MusicRef.current.volume = parseFloat(index)
        } catch (error) {
          
        }
      }
  
    })
  }, [socket, queueIndex])
  
  /* socket.on('getCMD', (cmd, index) => {
    console.log(cmd, index)
    if(cmd === 'skip'){
      HandleNext()
    }
    else if(cmd == 'back'){
      HandleRewind()
    }
    else if(cmd == 'loop'){
      if(parseInt(index) === 0){
        setIsLooping(false)
      }
      else if (parseInt(index) == 1) {
        setIsLooping(true)
      }
    }
    else if(cmd == 'play'){
      if(parseInt(index) - 1 < 0) return
      if(parseInt(index) - 1 > queue.length - 1) return
      setQueueIndex(parseInt(index) - 1)
    }
    else if(cmd == 'volume'){
      if(parseFloat(index) > 1.0) return
      if(parseFloat(index) < 0.01) return
      try {
        MusicRef.current.volume = parseFloat(index)
      } catch (error) {
        
      }
    }

  }) */


  const [musicState, setMusicState] = useState({
    isPlaying: false,
    totalDuration: '0:00',
    duration: '0:00',
    time: 0,
    played: 0,
    seeking: false,
    volume: 1,
    muted: false,
  })

  const {
    isPlaying,
    totalDuration,
    duration,
    time,
    played,
    seeking,
    volume,
    muted,
  } = musicState;

  window.top.document.title = queue[queueIndex] ? `Now Playing: ${queue[queueIndex].originalSongName}` : `Music Server By UniquezHD`
  
  useEffect(() => {
    getMusic === null && GetMusicData()

    getSongs === null && GetSongData()

  /*   setDiscoMode(true) */
  }, [])

  const MusicRef = useRef(null)

  if (process.env.NODE_ENV === 'production') {
    if (cookies.User === undefined && cookies.Token === undefined) {
      return <Redirect to={App} />
    }
  }

  const GetMusicData = () => {
    let api

    if (process.env.NODE_ENV !== 'production') {
      api = 'http://localhost:9001/api/get/music/'
    } else {
      api = xxxx
    }

    fetch(api, {
      method: "get",
      headers: { "Content-Type": "application/json" },
      params: {}
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setMusic(data);
          console.log(data)
        }
      })/* .catch(() => {
        const popup = document.getElementById('popup')
        popup.style.visibility = 'visible'
      }); */
  };

  const GetSongData = () => {
    let api

    if (process.env.NODE_ENV !== 'production') {
      api = 'http://localhost:9001/api/get/music/songs'
    } else {
      api = xxxx
    }

    fetch(api, {
      method: "get",
      headers: { "Content-Type": "application/json" },
      params: {}
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setSongs(data);
          console.log(data)
        }
      })/* .catch(() => {
        const popup = document.getElementById('popup')
        popup.style.visibility = 'visible'
      }); */
  };

  const format = (seconds) => {
    if (isNaN(seconds)) {
      return `00:00`;
    }
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const RenderPlayingNow = () => {
    try{
      if(queue[queueIndex].songFilePath != ''){
        return (
          <>
            <img className='now-playing-picture' src={queue[queueIndex].songPicture} alt="" />
            <p className='now-playing-song'>{queue[queueIndex].originalSongName}</p>
            <p className='now-playing-artist'>{queue[queueIndex].originalName}</p>
            <p className='now-playing-feat'>Feat. {queue[queueIndex].feat}</p>
          </>
        )
      }
    } catch {

    }
  }

  const HandlePlay = () => { 
    let total = format(MusicRef.current.duration)

    setMusicState({ 
      ...musicState, 
      totalDuration: total
    })
  }

  const HandlePlayPause = () => {
    if(isPlaying){
      MusicRef.current.pause() 
      setMusicState({ ...musicState, isPlaying: !musicState.isPlaying })
    }

    else if (!isPlaying){
      MusicRef.current.play()
      setMusicState({ ...musicState, isPlaying: !musicState.isPlaying })
    }
  }

  const RenderPlayPause = () => {
    if(isPlaying){
      return <Io5Icons.IoPause onClick={HandlePlayPause} className='now-playing-icons'/>
    }
    
    else if(!isPlaying){
      return <Io5Icons.IoPlay onClick={HandlePlayPause} className='now-playing-icons'/> 
    }
  }

  const HandleFastForward = () => {
    MusicRef.current.currentTime = MusicRef.current.currentTime += 10
  }

  const HandleFastRewind = () => {
    MusicRef.current.currentTime = MusicRef.current.currentTime -= 10
  }

  const HandleTime = () => {

    let e = MusicRef.current.currentTime

    setMusicState({
      ...musicState,
      duration: format(MusicRef.current.currentTime),
      time: (100 / MusicRef.current.duration) * e
    })
  }

  const HandleOnInput = (e) => {
    let time = MusicRef.current.duration * (e.target.value / 100)

    let timeBar = e.target.value

    console.log(time)

    MusicRef.current.currentTime = time

    setMusicState({
      ...musicState,
      played: time,
      time: timeBar,
      duration: format(MusicRef.current.currentTime),
    });

  }

  const HandleMouseDown = () => {
    setMusicState({
      ...musicState,
      seeking: true,
    });
  }

  const HandleVolume = (e, newValue) => {

   /*  if(queue[queueIndex]){
      
    } */

    try {
      MusicRef.current.volume = e.target.value
    } catch {
      
    }

    setMusicState({
      ...musicState,
      volume: parseFloat(e.target.value / 100),
      muted: newValue === 0 ? true : false
    })

  }

  const RenderVolumeIcon = () => {
    if(muted | volume * 100 === 0){
      return <Io5Icons.IoVolumeMute onClick={() => setMusicState({ ...musicState, muted: !musicState.muted})} className='music-volume-icon'/>
    } else if(volume * 100 >= .75){     
      return <Io5Icons.IoVolumeHigh onClick={() => setMusicState({ ...musicState, muted: !musicState.muted})} className='music-volume-icon'/>
    } else if(volume * 100 >= .4){     
      return <Io5Icons.IoVolumeMedium onClick={() => setMusicState({ ...musicState, muted: !musicState.muted})} className='music-volume-icon'/>
    } else if(volume * 100 <= .4){
      return <Io5Icons.IoVolumeLow onClick={() => setMusicState({ ...musicState, muted: !musicState.muted})} className='music-volume-icon'/>
    }
  }

  const SearchQueue = (event) => {
    if(event.target.value === null){
      setSearchQueue('<')
    } else {
      setSearchQueue(event.target.value.toLocaleLowerCase())
    }
  }

  const Search = (event) => {
    if (event.target.value === null) {
      setSearch('<')
    } else {
      setSearch(event.target.value.toLocaleLowerCase())
    }
  }

  const HandleDelete = (indexToDelete) => {
    const newData = [...queue.slice(0, indexToDelete), ...queue.slice(indexToDelete + 1)]
    setQueue(newData)
  }

  const RandomSongs = (amount) => {
    const random = getSongs.map((a) => ({ sort: Math.random(), value: a })).sort((a, b) => a.sort - b.sort).slice(0, amount).map((a) => a.value)
    setQueue(queue => [
      ...queue, 
      ...random
    ])
  }

  const MoveAllSongsToQueue = () => {
    if(getSongs){
      setQueue(getSongs)
    }
  }

  const MoveQueueUp = (index) => {
    const updatedItems = [...queue];
    
    const [removedItem] = updatedItems.splice(index, 1);

    updatedItems.unshift(removedItem);
    
    setQueue(updatedItems);
    setQueueIndex(queueIndex + 1)
  };

  const HandleRewind = () => {
    if(!queueIndex == 0 ){
      setQueueIndex(queueIndex - 1)
      setMusicState({ ...musicState, isPlaying: true })
    }
  }

  const HandleNext = () => {
    if(queueIndex != queue.length - 1){
      setQueueIndex(queueIndex + 1)
      setMusicState({ ...musicState, isPlaying: true })
    }
  }

  const HandleShuffle = () => {
    const shuffle = queue.map((a) => ({ sort: Math.random(), value: a })).sort((a, b) => a.sort - b.sort).slice(0, queue.length).map((a) => a.value)
    setQueueIndex(0)
    setQueue(shuffle)
  }

  const HandleKeys = (e) => {
    e.preventDefault()
    console.log(e.keyCode);
    switch (e.keyCode) {
      case 38:
        HandleRewind()
        break;
      case 40:
        HandleNext()
        break;
      case 37:
        HandleShuffle()
        break;
      case 39:
        HandleDelete(queueIndex)
        break;
      default:
    }
  }

  const ToggleSearchMode = () => {

  }

  const ToggleDiscordMode = () => {

    setDiscordMode(!discordMode)

    let api
    if (process.env.NODE_ENV !== 'production') {
      api = 'http://localhost:9001/api/init/bot'
    } else {
      api = xxxx
    }

    axios({
      method: 'post',
      url: api,
      data: {
        toggleState: discordMode
      }
    })
  }

  const HandleRightClick = (e) => {
    e.preventDefault()  
  }

  return (
    <>
    <div className={`confetti-container ${isDiscoMode ? 'visible' : ''}`}>
        <img xxxxssid=0R1Y1K6&fid=0R1Y1K6&open=normal&ep=" />
      </div>
    <div className={`discoball-container ${isDiscoMode ? 'visible' : ''}`}>
        <img xxxxssid=0hngtrj&fid=0hngtrj&open=normal&ep=" />
      </div>
      <div className={`dancers-container ${isDiscoMode ? 'visible' : ''}`}>
        <img xxxxssid=04IGEMe&fid=04IGEMe&open=normal&ep=" />
      </div>
      <div className={`dancers-container1 ${isDiscoMode ? 'visible' : ''}`}>
        <img xxxxssid=0ozsWSL&fid=0ozsWSL&open=normal&ep=" />
      </div>
      <div className={`dancers-container2 ${isDiscoMode ? 'visible' : ''}`}>
        <img xxxxssid=0PsRq1U&fid=0PsRq1U&open=normal&ep=" />
      </div>
      <div className={`dancers-container3 ${isDiscoMode ? 'visible' : ''}`}>
        <img xxxxssid=0PsYQKk&fid=0PsYQKk&open=normal&ep=" />
      </div>
      <div className={`dancers-container4 ${isDiscoMode ? 'visible' : ''}`}>
        <img xxxxssid=05G6H3z&fid=05G6H3z&open=normal&ep=" />
      </div>
      <div className={`dancers-container5 ${isDiscoMode ? 'visible' : ''}`}>
        <img xxxxssid=051B7yJ&fid=051B7yJ&open=normal&ep=" />
      </div>
      <div className={`dancers-container6 ${isDiscoMode ? 'visible' : ''}`}>
        <img xxxxssid=07TWUWH&fid=07TWUWH&open=normal&ep=" />
      </div>

      <div className="audio-container">

     {queue[queueIndex] && (
       <audio   
       autoPlay
       src={queue[queueIndex].songFilePath} 
       ref={MusicRef}
       onPlay={HandlePlay}
       onTimeUpdate={HandleTime}
       muted={muted}
       onError={() => {
        if(queueIndex == queue.length - 1){
          noSleep.disable()
        } else {
          setQueueIndex(queueIndex + 1)}
        }
       }  
       onEnded={() => {
       try {

        console.log("d ", queue.length)
        console.log("w ", queueIndex)

        if(queueIndex == queue.length - 1){
/*           setQueueIndex(queueIndex - queue.length)
          console.log(queueIndex)
          MusicRef.current.play() */
          
          noSleep.disable()
        }

        if(!isLooping){
          setQueueIndex(queueIndex + 1)
        } else {
          MusicRef.current.play()
        }
       } catch (error) {
        noSleep.disable()
        // hvis en sang failer bliver det ogs[ disabled not gud
       }
      }}
       />
     )}

        <div className="music-player-bar">

          <div className="music-player-bar-right">

          {RenderVolumeIcon()}
          
          <input className='music-volume-slider' defaultValue="0.01" type="range" min="0" max="1" step="0.01" onChange={(e) => HandleVolume(e)}/>

          </div>

          <div className="music-player-bar-middle"  onKeyDown={(e) => HandleKeys(e)}>
          <Io5Icons.IoShuffle onClick={() => HandleShuffle()} className='now-playing-icons'/>
          <Io5Icons.IoPlaySkipBack onClick={() => HandleRewind()} className='now-playing-icons'/>
          <Io5Icons.IoPlayBack onClick={() => HandleFastRewind()} className='now-playing-icons'/>

          {RenderPlayPause()}

          <Io5Icons.IoPlayForward onClick={() => HandleFastForward()} className='now-playing-icons'/>
          <Io5Icons.IoPlaySkipForward onClick={() => HandleNext()} className='now-playing-icons'/>
          <Io5Icons.IoReload onClick={() => setIsLooping(!isLooping)} className={ isLooping ? `now-playing-icons-active` : `now-playing-icons`}/>
          <div className="music-slider-container">
            <div>
            <span className='music-current-time'>{musicState.duration}</span>
            
            <input 
            type="range" 
            className="music-slider" 
            min="0" 
            max="100" 
            value={musicState.time} 
            onInput={(e) => HandleOnInput(e)}
            onMouseDown={HandleMouseDown}
            step="1"/>
            
            <span className='music-total-time'>{musicState.totalDuration}</span>

            </div>
          </div>
          
          </div>
          <div className="music-player-bar-left">
             
             { queue && RenderPlayingNow() }
           
          </div>
        </div>

        <div className="header-bar">
       <div className="header-bar-1">
        <div className="music-page-artist-button">Songs</div>
        <input className='music-search' onChange={(e) => Search(e)} placeholder='🔎︎ Search' type="text" />
       </div>
       <div className="header-bar-3">
       <div className="music-page-artist-button">Queue</div>
       <div className="music-header-filler">
          <CgIcons.CgMoveRight className='queue-buttons-icons-small' onClick={() => noSleep.enable() & setMusicState({ ...musicState, isPlaying: true }) & MoveAllSongsToQueue()} />
          <BiIcons.BiSolidAddToQueue className='queue-buttons-icons' onClick={() => noSleep.enable() & setMusicState({ ...musicState, isPlaying: true }) & RandomSongs(10)} />
          <GiIcons.GiBroom className='queue-buttons-icons-clear' onClick={() => setQueue([])} />
          <FaIcons.FaDiscord className={ discordMode ? `queue-buttons-icons` : `queue-buttons-icons-active`} onClick={() => setDiscordMode(!discordMode) & ToggleDiscordMode()}/>
          <IoIcons.IoSearch className={ searchMode ? `queue-buttons-icons` : `queue-buttons-icons-active`} onClick={() => setSearchMode(!searchMode) & ToggleSearchMode()} />
          {!searchMode && (
            <input className="music-queue-search" placeholder='🔎︎ Search' type="text" onChange={(e) => SearchQueue(e)}/>
          )}
       </div>
       </div>      
       <div className="header-bar-4">
       <div className="music-page-artist-button">Playlist</div>
        <input className='music-search' placeholder='🔎︎ Search' type="text" />
       </div>
        </div>

      <div className="album-bar">

          {getSongs && getSongs.filter(Data => Data.originalSongName.toLocaleLowerCase().includes(search) | Data.originalName.toLocaleLowerCase().includes(search) | search == '<').map((item, i) => {
          return (
            <>   {/* f[ right click til at s;tte den valgte sang igang med det samme */}
              <div className="songs-container" onContextMenu={(e) => HandleRightClick(e)} onClick={() => noSleep.enable() & setMusicState({ ...musicState, isPlaying: true }) & setQueue(queue => [...queue, {
                originalName: item.originalName,
                englishName: item.englishName,
                album: item.album,
                originalSongName: item.originalSongName,
                songNameEnglish: item.songNameEnglish,
                songPicture: item.songPicture,
                feat: item.feat,
                songFilePath: item.songFilePath
              }])}>
                <img className='song-cover' src={item.songPicture} alt="" />
                <p className='song-name'>{item.originalSongName}</p>
                <p className='song-artist'>{item.originalName}</p>
                <p className='song-feat'>Feat. {item.feat}</p>
              </div>
            </>
          )
        })}
      </div>

      <div className="songs-bar">
     
        {queue && Object.values(queue).filter(Data => Data.originalSongName.toLocaleLowerCase().includes(searchQueue) | Data.originalName.toLocaleLowerCase().includes(searchQueue) | searchQueue == '<').map((item, i) => {
          let active

          try {
            active = queueIndex
          } catch (error) {
            
          }

          return (
            <>
              <div className={ active == i ? `queue-container-playing` : `queue-container`} onClick={() => noSleep.enable() & setMusicState({ ...musicState, isPlaying: true }) & setQueueIndex(i)}>
                <p className='queue-index-number'>{i + 1}</p>
                <img className='song-cover' src={item.songPicture} alt="" />
                <p className='song-name'>{item.originalSongName}</p>
                <p className='song-artist'>{item.originalName}</p>
                <Io5Icons.IoClose onClick={() => HandleDelete(i)} className='song-clear-from-queue-button'/>
                <ImIcons.ImMoveUp onClick={() => MoveQueueUp(i)} className='song-clear-from-queue-button'/>
                <p className='song-feat'>Feat. {item.feat}</p>
              </div>
            </>
          )
        })}
        
      </div>

        <div className="playlist-bar">
        {/* https://www.vecteezy.com/vector-art/7227411-just-dance-vintage-3d-vector-lettering-retro-party-bold-font-typeface-pop-art-stylized-text-old-school-style-neon-light-letters-90s-80s-poster-banner-dark-violet-color-background */}
        <div className="album-container">
          <img className='album-cover' xxxxex=6637e5dc&is=662570dc&hm=9fa36a20919fc2a0b5b8fe9b48fc458c498fb307a136161851a03969522dfe52&" alt="" />
          <p className='album-name'>Rock</p>
        </div>

        <div className="album-container">
          <img className='album-cover' xxxxday-vintage-3d-neon-light-lettering-retro-bold-font-pop-art-stylized-text-old-school-style-letters-90s-80s-concert-promo-poster-banner-typography-design-dark-blue-color-background-vector.jpg" alt="" />
          <p className='album-name'>Jazz</p>
        </div>

        <div className="album-container">
          <img className='album-cover' xxxxmusic-vintage-3d-lettering-retro-bold-font-typeface-pop-art-stylized-text-old-school-style-neon-light-letters-90s-80s-poster-banner-dark-violet-color-background-vector.jpg" alt="" />
          <p className='album-name'>Pop</p>
        </div>

        </div>

      </div>
    </>
  )
}

export default Audio

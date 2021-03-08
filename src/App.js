import React, { useState } from 'react';
import Pizzicato from 'pizzicato';
import { MdPlayArrow, MdPause } from 'react-icons/md';

import { discombobulate, downloadAudio } from './audio.js';
import './App.css';
import definition from './definition.jpg'

//TODO: figure out pitch stuff
//TODO: stop extra sound after pause

function App() {


    const [audio, setAudio] = useState(null);
    const [discombobulated, setDiscombobulated] = useState(false);
    const [playing, setPlaying] = useState(false);

    const onFileChange = (event) => {
        const audioFile = URL.createObjectURL(event.target.files[0]);
        const audio = new Pizzicato.Sound({ source: 'file', options: { path: audioFile } }, () => { });
        setAudio(audio);
    }

    const onDiscombobulate = () => {
        audio.stop();
        discombobulate(audio);
        setDiscombobulated(true); setPlaying(false);
    }

    // TODO: get this working (correct length of context + the buffer downloading)
    const onDownloadAudio = () => {
        const oldContext = Pizzicato.context;
        const offlineContext = new OfflineAudioContext(
            2,
            44100 * NaN,
            44100
        );
        Pizzicato.context = offlineContext;
        const renderPromise = offlineContext.startRendering();
        renderPromise.then(renderedBuffer => {
            downloadAudio(renderedBuffer);
        });
        Pizzicato.contect = oldContext;
    }

    return (
        <div className="app">
            {/* <h1>The Discombobulator</h1> */}
            <img id="definition" src={definition} alt="" />

            <section>
                <input type="file" accept="audio/*" onChange={onFileChange} />
            </section>

            <section>
                {audio &&
                    <>
                        <button id="discombobulate-btn"
                            onClick={onDiscombobulate}>DISCOMBOBULATE!</button>
                    </>
                }
            </section>

            <section>
                {discombobulated &&
                    <div className="final-btns">
                        <button id="play-pause-btn"
                            onClick={() => {
                                if (playing) audio.pause()
                                else audio.play()
                                setPlaying(!playing);
                            }}>
                            {playing ? <MdPause size={50} /> : <MdPlayArrow size={50} />}
                        </button>
                        <button onClick={onDownloadAudio}>
                            DOWNLOAD!
                        </button>
                    </div>
                }
            </section>
        </div>
    );
}

export default App;

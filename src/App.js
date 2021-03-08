import React, { Component } from 'react';
import Pizzicato from 'pizzicato';

import discombobulate from './audio.js';
import './App.css';

//TODO: figure out pitch stuff
//TODO: make everything pretty
//TODO: download audio

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            audio: null,
            discombobulated: false,
            playing: false
        };
    }

    onFileChange = (event) => {
        const audio = URL.createObjectURL(event.target.files[0]);
        const sound = new Pizzicato.Sound({ source: 'file', options: { path: audio } }, () => { });
        this.setState({ audio: sound });
    }

    onDiscombobulate = () => {
        const { audio } = this.state;
        audio.pause();
        discombobulate(audio);
        this.setState({ discombobulated: true, playing: false });
        console.log(audio); //TODO: remove
    }

    render() {

        const { audio, discombobulated, playing } = this.state;

        return (
            <>
                <h2>Upload an audio file:</h2>
                <input type="file" onChange={this.onFileChange} />
                {audio &&
                    <>
                        <br />
                        <button onClick={this.onDiscombobulate}>DISCOMBOBULATE!</button>
                    </>
                }
                {discombobulated &&
                    <>
                        <br />
                        <button onClick={() => {
                            if (playing) audio.pause()
                            else audio.play()
                            this.setState({ playing: !playing })
                        }}>
                            {playing ? "PAUSE!" : "PLAY!"}
                        </button>
                    </>
                }
            </>
        );
    }
}

export default App;

import { handleGetMachineState, handleRun, handleAdvance6502,
  handleGetSpeed, handleSetNormalSpeed, handleGetTextPage,
  handleSetSaveState, handleGetSaveState, handleMemget } from "./iworker"
import { getPrintableChar } from "./utility"
import Apple2Canvas from "./canvas"
import ControlPanel from "./controlpanel"
import DiskInterface from "./diskinterface"
import { SWITCHES } from "./softswitches";
import { getFilename } from "./diskdata"
import React from 'react';
// import Test from "./components/test";

class DisplayApple2 extends React.Component<{},
  { currentSpeed: number;
    speedCheck: boolean;
    uppercase: boolean;
    isColor: boolean }> {
  timerID = 0
  refreshTime = 16.6881
  myCanvas = React.createRef<HTMLCanvasElement>()
  hiddenFileOpen: HTMLInputElement | null = null

  constructor(props: any) {
    super(props);
    this.state = {
      currentSpeed: 0,
      speedCheck: true,
      uppercase: true,
      isColor: true,
    };
  }

  update6502 = () => {
    handleAdvance6502()
    this.setState( {currentSpeed: handleGetSpeed()} )
  }

  componentDidMount() {
    this.timerID = window.setInterval(() => this.update6502(), this.refreshTime)
  }

  componentWillUnmount() {
    if (this.timerID) clearInterval(this.timerID);
  }

  handleSpeedChange = () => {
    handleSetNormalSpeed(this.state.speedCheck)
    window.clearInterval(this.timerID)
    this.timerID = window.setInterval(() => this.update6502(),
      this.state.speedCheck ? 0 : this.refreshTime)
    this.setState({ speedCheck: !this.state.speedCheck });
  };

  handleIsColor = () => {
    return this.state.isColor
  }

  handleColorChange = () => {
    this.setState({ isColor: !this.state.isColor });
  };

  handleUpperCaseChange = () => {
    this.setState({ uppercase: !this.state.uppercase });
  };


  handleRestoreState = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.length) {
      const fileread = new FileReader()
      const restoreSaveStateFunc = handleSetSaveState
      fileread.onload = function(e) {
        if (e.target) {
          restoreSaveStateFunc(e.target.result as string)
          handleRun()
        }
      };
      fileread.readAsText(e.target.files[0]);
    }
  };

  handleFileOpen = () => {
    if (this.hiddenFileOpen) {
      // Hack - clear out old file so we can pick the same file again
      this.hiddenFileOpen.value = "";
      this.hiddenFileOpen.click()
    }
  }

  handleFileSave = () => {
    const blob = new Blob([handleGetSaveState()], {type: "text/plain"});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    let name = getFilename(0)
    if (!name) {
      name = "apple2ts"
    }
    const d = new Date()
    let datetime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000 )).toISOString()
    datetime = datetime.replaceAll('-','').replaceAll(':','').split('.')[0]
    link.setAttribute('download', `${name}${datetime}.dat`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * For text mode, copy all of the screen text.
   * For graphics mode, do a bitmap copy of the canvas.
   */
  handleCopyToClipboard = () => {
    const textPage = handleGetTextPage()
    if (textPage.length === 960 || textPage.length === 1920) {
      const nchars = textPage.length / 24
      const isAltCharSet = handleMemget(SWITCHES.ALTCHARSET.isSetAddr) > 127
      let output = ''
      for (let j = 0; j < 24; j++) {
        let line = ''
        for (let i = 0; i < nchars; i++) {
          let value = textPage[j * nchars + i]
          let v1 = getPrintableChar(value, isAltCharSet)
          if (v1 >= 32 && v1 !== 127) {
            const c = String.fromCharCode(v1);
            line += c
          }
        }
        line = line.trim()
        output += line + '\n'
      }
      navigator.clipboard.writeText(output);
    } else {
      try {
        this.myCanvas.current?.toBlob((blob) => {
          if (blob) {
            navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob,
              })
            ])
          }
        })
      }
      catch (error) {
        console.error(error);
      }
    }
  }

  render() {
    const speed = this.state.currentSpeed.toFixed(3)
    const props: DisplayProps = {
      machineState: handleGetMachineState(),
      speed: speed,
      myCanvas: this.myCanvas,
      speedCheck: this.state.speedCheck,
      handleSpeedChange: this.handleSpeedChange,
      uppercase: this.state.uppercase,
      isColor: this.state.isColor,
      handleColorChange: this.handleColorChange,
      handleCopyToClipboard: this.handleCopyToClipboard,
      handleUpperCaseChange: this.handleUpperCaseChange,
      handleFileOpen: this.handleFileOpen,
      handleFileSave: this.handleFileSave,
    }

    const ctx = props.myCanvas.current?.getContext("2d")
    let width = 1280
    if (ctx) {
      width = ctx.canvas.width;
    }

    return (
      <div>
        <span className="apple2" style={{width:width}}>
          <Apple2Canvas {...props}/>
          <br />
          <span className="leftStatus">
            <ControlPanel {...props}/>
          </span>
          <span><DiskInterface speedCheck={this.state.speedCheck}/></span>
        </span>
        {/* <span className="statusPanel fixed small">
          {getStatuss6502, stack, mainMem.slice(0, 512))}
        </span> */}
        <input
          type="file"
          accept=".dat"
          ref={input => this.hiddenFileOpen = input}
          onChange={this.handleRestoreState}
          style={{display: 'none'}}
        />
      </div>
    );
  }
}

export default DisplayApple2;

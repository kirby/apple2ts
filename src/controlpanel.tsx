import { STATE } from "./emulator/utility";
import { handleAppleCommandKeyPress, handleAppleCommandKeyRelease, handleSetCPUState } from "./main2worker"
import { getAudioContext } from "./speaker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faClipboard,
  faExpand,
  faFolderOpen,
  faPause,
  faPlay,
  faPowerOff,
  faSave,
  // faCircle as iconLeftButton,
  // faCircle as iconRightButton,
} from "@fortawesome/free-solid-svg-icons";
import {
} from "@fortawesome/free-regular-svg-icons";

const ControlPanel = (props: DisplayProps) => {
//  const narrow = window.innerWidth < 400
  const controlButtons = <span>
        <button
          title="Boot"
          onClick={() => {
            if (getAudioContext().state !== "running") {
              getAudioContext().resume();
            }
            handleSetCPUState(STATE.NEED_BOOT)
          }}>
          <FontAwesomeIcon icon={faPowerOff}/>
        </button>
        <button
          title="Reset"
          onClick={() => {
            if (getAudioContext().state !== "running") {
              getAudioContext().resume();
            }
            handleSetCPUState(STATE.NEED_RESET)
          }}
          disabled={props.machineState === STATE.IDLE || props.machineState === STATE.NEED_BOOT}
          >
          <FontAwesomeIcon icon={faArrowRotateRight}/>
        </button>
        <button
          title={props.machineState === STATE.PAUSED ? "Resume" : "Pause"}
          onClick={() => {props.machineState === STATE.PAUSED ?
            handleSetCPUState(STATE.RUNNING) : handleSetCPUState(STATE.PAUSED)}}
          disabled={props.machineState === STATE.IDLE}>
          {props.machineState === STATE.PAUSED ?
          <FontAwesomeIcon icon={faPlay}/> :
          <FontAwesomeIcon icon={faPause}/>}
        </button>
        <button title="Restore State"
          onClick={() => props.handleFileOpen()}>
          <FontAwesomeIcon icon={faFolderOpen}/>
        </button>
        <button title="Save State"
          onClick={() => props.handleFileSave()}
          disabled={props.machineState === STATE.IDLE || props.machineState === STATE.NEED_BOOT}
        >
          <FontAwesomeIcon icon={faSave}/>
        </button>
        <button title="Copy Screen"
          onClick={() => props.handleCopyToClipboard()}>
          <FontAwesomeIcon icon={faClipboard}/>
        </button>
        <button title="Full Screen"
          onClick={() => {
            const context = props.myCanvas.current
            if (context) {
              let requestFullScreen: any
              if ('webkitRequestFullscreen' in context) {
                requestFullScreen = context.webkitRequestFullscreen
              } else if ('mozRequestFullScreen' in context) {
                requestFullScreen = context.mozRequestFullScreen
              } else if ('msRequestFullscreen' in context) {
                requestFullScreen = context.msRequestFullscreen
              } else if ('requestFullscreen' in context) {
                requestFullScreen = context.requestFullscreen
              }
              if (requestFullScreen) {
                requestFullScreen.call(context);
              }
            }
          }
            }>
          <FontAwesomeIcon icon={faExpand}/>
        </button>
      </span>
  const arrowButtons = <span>
        <button title="Left"
          onClick={() => {
            handleAppleCommandKeyPress(true)
            setTimeout(() => handleAppleCommandKeyRelease(true), 500)
          }}><b>&#x2460;</b>
          {/* <FontAwesomeIcon icon={iconLeftButton}/> */}
        </button>
        <button title="Right"
          onClick={() => {
            handleAppleCommandKeyPress(false)
            setTimeout(() => handleAppleCommandKeyRelease(false), 500)
          }}><b>&#x2461;</b>
          {/* <FontAwesomeIcon icon={iconRightButton}/> */}
        </button>
      </span>
  return (
    <span>
      {controlButtons}
      {arrowButtons}
      <br/>

      <span className="statusItem">
        <label>
          <input
            type="checkbox"
            checked={props.speedCheck}
            onChange={props.handleSpeedChange}
          />
          1 MHz
        </label>
      </span>
      <span className="statusItem">
        <label>
          <input
            type="checkbox"
            checked={props.uppercase}
            onChange={props.handleUpperCaseChange}
          />
          Uppercase
        </label>
      </span>
      <span className="statusItem">
        <label>
          <input
            type="checkbox"
            checked={props.isColor}
            onChange={props.handleColorChange}
          />
          Color
        </label>
      </span>
      <br />

      {/* <span className="statusItem">
        <span className="fixed">{handleGetSpeed()}</span> MHz
      </span> */}
      {/* <span className="statusItem">
        <span className="fixed">{toHex(props.s6502.PC, 4)}</span>
      </span> */}
    </span>
  )
}

export default ControlPanel;

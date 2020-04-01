import React, { useEffect, useRef, useState, useReducer } from 'react';
import './App.css';

const initContentState = {
  curEl: null,
  selectArea: null,
  parentEl: null,
  count: 0
}

function reducer(state, action) {
  switch(action.type) {
    case 'update':
      return {...state, ...action.data}
    default:
      return state
  }
}

function App() {
  const cropper = useRef()
  const [state, dispatch] = useReducer(reducer, initContentState)

  const onMoveStart = (e) => {
    const { curEl, parentEl, selectArea } = state
    if (!curEl || !parentEl || !selectArea) return

    // 移动中实时计算位置
    const moveLeft = e.clientX - selectArea.left
    const moveRight = e.clientY - selectArea.top
    
    const newStyle = curEl.style
    newStyle.left = moveLeft + 'px'
    newStyle.top = moveRight + 'px'
  }

  // 移动开始
  const handleMouseStart = (e) => {
    // 当前的
    const curEl = cropper.current
    console.log(cropper.current.offsetLeft, e.clientX)
    // 父级的
    const parentEl = cropper.current.parentElement
    // 选中区域
    const selectArea = {
      posLeft: e.clientX,
      posTop: e.clientY,
      left: e.clientX - curEl.offsetLeft,
      top: e.clientY - curEl.offsetTop,
      maxMoveX: parentEl.offsetWidth - curEl.offsetWidth,
      maxMoveY: parentEl.offsetHeight - curEl.offsetHeight
    }

    dispatch({type: 'update', data:{ curEl, parentEl, selectArea , count: 1 }})
  
    document.addEventListener(
      'mousemove',
      onMoveStart,
      false
    )

    document.addEventListener(
      'mouseup',
      handleMoveCloses,
      false
    )
  }

  // 鼠标结束
  const handleMoveCloses = (e) => {
    document.removeEventListener('mousemove', onMoveStart, false)
    document.removeEventListener('mouseup', handleMoveCloses, false)
  }

  // resize
  const handleResize = () => {

  }

  return (
    <div className="App">
      <div>
        <div className="App-header">
          <img id="image" src={require('./image/123.jpg')} alt=""/>
        </div>
        <div className="cropper-drag-wrap"
          ref={cropper}
          onMouseDown={(e) => handleMouseStart(e)}
        >
          <span className="dashed-line slide-dashed-x"></span>
          <span className="dashed-line slide-dashed-y"></span>
          <span className="border-line slide-border-top"></span>
          <span className="border-line slide-border-left"></span>
          <span className="border-line slide-border-right"></span>
          <span className="border-line slide-border-bom"></span>
        </div>
      </div>
    </div>
  )
}

export default App;

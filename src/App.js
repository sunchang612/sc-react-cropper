import React, { useEffect, useRef, useState, useReducer, Component } from 'react';
import './App.css';

const initContentState = {
  curEl: '',
  selectArea: '',
  parentEl: '',
  isRefresh: false,
  resizeArea: '',
  moveEl: '',
  isMoveRefresh: false
}

function reducer(state, action) {
  switch(action.type) {
    case 'update':
      console.log('action---------->', action)
      return {...state, ...action.data}
    case 'reset':
      return {...state, ...action.data}
    default:
      return state
  }
}

function App() {
  const cropper = useRef()
  const rightLine = useRef()
  const [state, dispatch] = useReducer(reducer, initContentState)

  // 移动开始
  const handleMouseStart = (e) => {
    // 当前的
    const curEl = cropper.current
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
   
    dispatch({type: 'update', data:{ curEl, parentEl, selectArea , isRefresh: true }})
  }

  useEffect(() => {
    if (state.isRefresh) {
      document.addEventListener(
        'mousemove',
        onMoveStart,
      )
      document.addEventListener(
        'mouseup',
        handleMoveCloses,
        false
      )
    }
    if (state.isMoveRefresh) {
      document.addEventListener(
        'mouseup',
        handleMoveCloses,
        false
      )
      document.addEventListener('mousemove', handleReset, false)
    }
    return () => {
      document.removeEventListener('mousemove', onMoveStart, false)
      document.removeEventListener('mouseup', handleMoveCloses, false)
      document.removeEventListener('mousemove', handleReset, false)
    }
  }, [state.isRefresh, state.isMoveRefresh])

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

  // 鼠标结束
  const handleMoveCloses = () => {
    dispatch({type: 'reset', data:{ curEl: '', parentEl: '', selectArea: '' , isRefresh: false, isMoveRefresh: false }})
  }

  // resize
  const handleResizeReady = (e, direction) => {
    e.stopPropagation()

    const curEl = cropper.current
  
    const resizeArea = {
      posLeft: e.clientX,
      posTop: e.clientY,
      width: curEl.offsetWidth,
      height: curEl.offsetHeight,
      left: parseInt(curEl.style.left, 10),
      top: parseInt(curEl.style.top, 10)
    }
    dispatch({type: 'update', data:{ resizeArea, isMoveRefresh: true, direction, moveEl: e}})
  }

  const handleReset = (e) => {
    const { resizeArea, direction, moveEl } = state
    
    const curEl = cropper.current

    if (!resizeArea || !moveEl) return
    // return
    // 获取父级元素
    const container = cropper.current.parentElement
    const parHeight = container.offsetHeight
    const parWidth = container.offsetWidth
    const parLeft = parseInt(container.style.left || 0, 10)
    const parRight = parseInt(container.style.top || 0, 10)
    // const curEl = cropper.current
    if (direction === 'r' || direction === 'b') {
      let moveLength
      if (direction === 'r') {
        moveLength = resizeArea.width + parseInt(e.clientX, 10) - resizeArea.posLeft
      } else {
        moveLength = resizeArea.height + e.clientY - resizeArea.posTop
      }

      if (parseInt(curEl.style.left, 0) + moveLength > parWidth || parseInt(curEl.style.top, 10) + moveLength > parHeight) {
        const w = parWidth - parseInt(curEl.style.left, 10)
        const h = parHeight - parseInt(curEl.style.top, 10)
        curEl.style.width = curEl.style.height = Math.min(w, h) + 'px'
      } else {
        curEl.style.width = moveLength + 'px'
        curEl.style.height = moveLength + 'px'
      }
    } else {

    }
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
          <span className="border-line slide-border-top" onMouseDown={(e) => handleResizeReady(e, 't')}></span>
          <span className="border-line slide-border-left" onMouseDown={(e) => handleResizeReady(e, 'l')}></span>
          <span className="border-line slide-border-right" onMouseDown={(e) => handleResizeReady(e, 'r')}></span>
          <span className="border-line slide-border-bom" onMouseDown={(e) => handleResizeReady(e, 'b')}></span>
        </div>
      </div>
    </div>
  )
}

export default App;

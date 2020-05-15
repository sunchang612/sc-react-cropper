import React, { useEffect, useRef, useReducer, useCallback } from 'react';
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
      return {...state, ...action.data}
    case 'reset':
      return {...state, ...action.data}
    default:
      return state
  }
}

function App() {
  const cropper = useRef()
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


  const handleReset = useCallback((e) => {
    const { resizeArea, direction, moveEl, isMoveRefresh } = state
    
    const curEl = cropper.current

    if (!resizeArea || !moveEl || !isMoveRefresh) return
    // return
    // 获取父级元素
    const container = cropper.current.parentElement
    const parHeight = container.offsetHeight
    const parWidth = container.offsetWidth
    const parLeft = parseInt(container.style.left || 0, 10)
    const parTop = parseInt(container.style.top || 0, 10)
    // const curEl = cropper.current
    if (direction === 'r' || direction === 'b') {
      let moveLength
      if (direction === 'r') {
        moveLength = resizeArea.width + parseInt(e.clientX, 10) - resizeArea.posLeft
      } else {
        moveLength = resizeArea.height + e.clientY - resizeArea.posTop
      }

      // 到达右边界
      if (parseInt(curEl.style.left, 0) + moveLength > parWidth || parseInt(curEl.style.top, 10) + moveLength > parHeight) {
        const w = parWidth - parseInt(curEl.style.left, 10)
        const h = parHeight - parseInt(curEl.style.top, 10)
        curEl.style.width = curEl.style.height = Math.min(w, h) + 'px'
      } else {
        curEl.style.width = moveLength + 'px'
        curEl.style.height = moveLength + 'px'
      }
    } else {
      // 移动的长度
      let moveLength
      // 向左移动
      if(direction === 'l') {
        moveLength = resizeArea.posLeft - e.clientX
      } else { // 向上移动
        moveLength = resizeArea.posTop - e.clientY
      }
      // 距离左边距的位置
      const leftLength = resizeArea.left - moveLength
      // 距离上边距的位置
      const topLength = resizeArea.top - moveLength

      // 到达边界 做边界判断
      if (leftLength <= parLeft || topLength < parTop) {
        const isMargin = resizeArea.left - parLeft

        // 判断顶部会不会超出
        // 到达左边界
        if (isMargin < resizeArea.top) {
          curEl.style.top = `${resizeArea.top - isMargin}px`
          curEl.style.left = `${parLeft}px`
        } else {
          curEl.style.top = `${parTop}px`
          curEl.style.left = `${resizeArea.left + parTop - resizeArea.top}px`
        }
      } else {
        // 改变选择框的 大小
        curEl.style.left = `${leftLength}px`
        curEl.style.top = `${topLength}px`
        curEl.style.width = `${resizeArea.width + moveLength}px`
        curEl.style.height = `${resizeArea.height + moveLength}px`
      }
    }
  }, [state])

  const onMoveStart = useCallback((e) => {
    const { curEl, parentEl, selectArea, isRefresh } = state
    if (!curEl || !parentEl || !selectArea || !isRefresh) return
    // 移动中实时计算位置
    let moveLeft = e.clientX - selectArea.left
    let moveTop = e.clientY - selectArea.top

    // 左边距判断
    if (moveLeft <= 0) {
      moveLeft = 0
    } else if (moveLeft > selectArea.maxMoveX) { // 右边可移动范围
      moveLeft = selectArea.maxMoveX
    }
    if (moveTop <= 0) {
      moveTop = 0
    } else if (moveTop > selectArea.maxMoveY)  { // 下 可移动范围
      moveTop = selectArea.maxMoveY
    }
    
    const newStyle = curEl.style
    newStyle.left = moveLeft + 'px'
    newStyle.top = moveTop + 'px'
  }, [state])

  useEffect(() => {
    if (handleReset) {
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
    if (onMoveStart) {
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
  }, [handleReset, onMoveStart])

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

  const handleClick = () => {
    const cropCanvas = document.createElement('canvas')

    const style = cropper.current.style
    // 因为默认位置 这里是 NAN
    const top =  parseFloat(style.top) || 0
    const left = parseFloat(style.left) || 0
    const width = cropper.current.clientWidth
    const height = cropper.current.clientHeight

    cropCanvas.height = height
    cropCanvas.width = width
    const resImg = new Image()
    const imgUrl = require('./image/123.jpg')
    resImg.src = imgUrl
    resImg.onload = () => {

      cropCanvas.getContext('2d').drawImage(resImg,  left, top, width, height, 0, 0, width, height)
      document.getElementById('img').src = cropCanvas.toDataURL('image/png', 1)
    }
  }

  return (
    <div className="App">
      <div  className="container">
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

      <div className="cropper-btn" onClick={handleClick}>裁剪图片</div>
      {/* <canvas id="canvas"></canvas> */}
      <img id="img" alt=""></img>
    </div>
  )
}

export default App;

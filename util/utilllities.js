import { useState } from 'react'
import '../css/Loading.css'

const useLocalState = (item) => {
  const [local, setState] = useState(localStorage.getItem(item))

  function setLocal(newItem){
    localStorage.setItem(item, newItem)
    setState(newItem)
  }

  return [local, setLocal]
}

function Loading() {
  return (
    <>
      <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    </>
  )
}

export { useLocalState, Loading }
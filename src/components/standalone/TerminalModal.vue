<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div class="w-5/6 p-1 bg-yellow-100 border border-gray-300 rounded shadow-2xl h-5/6">
        <div class="flex justify-end">
          <button class="m-1 font-bold text-black" @click="$emit('close')">X</button>
        </div>
        <div ref="terminal" class="w-full h-full px-2 pb-2 font-mono text-sm"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import { Terminal } from 'xterm'
  import 'xterm/css/xterm.css'
  
  const props = defineProps({ visible: Boolean })
  const emit = defineEmits(['close'])
  
  const terminalRef = ref(null)
  
  onMounted(() => {
    if (!props.visible) return
  
    const term = new Terminal({
      theme: {
        background: '#fdf6b2', // match light yellow
        foreground: '#000000'
      },
      fontFamily: 'monospace',
      fontSize: 14
    })
  
    term.open(terminalRef.value)
  
    const socket = new WebSocket('ws://localhost:3000/ssh') // Secure this properly
  
    socket.onopen = () => {
      term.write('Connecting to NexappOS...\r\n')
    }
  
    socket.onmessage = (event) => {
      term.write(event.data)
    }
  
    term.onData(data => {
      socket.send(data)
    })
  
    socket.onclose = () => {
      term.write('\r\nConnection closed.')
    }
  
    socket.onerror = (err) => {
      term.write(`\r\nError: ${err.message}`)
    }
  })
  </script>
  
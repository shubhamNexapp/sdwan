<template>
    <div class="container">
      <h2>OpenWISP Configuration</h2>
      <div>
        <label>Status:</label>
        <input v-model="config.status" disabled />
      </div>
      <div>
        <label>Server URL:</label>
        <input v-model="config.url" />
      </div>
      <div>
        <label>Interface:</label>
        <select v-model="config.management_interface">
          <option value="wg0">wg0</option>
          <option value="zt0">zt0</option>
        </select>
      </div>
      <div>
        <label>Shared Secret:</label>
        <input v-model="config.shared_secret" type="password" />
      </div>
      <div>
        <label>Verify SSL:</label>
        <select v-model="config.verify_ssl">
          <option value="1">Enabled</option>
          <option value="0">Disabled</option>
        </select>
      </div>
      <button @click="fetchConfig">Fetch Config</button>
      <button @click="setConfig">Save Config</button>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        config: {
          status: "",
          service: "enable",
          url: "",
          management_interface: "wg0",
          shared_secret: "",
          verify_ssl: "0",
        },
      };
    },
    methods: {
      async fetchConfig() {
        try {
          const response = await axios.post("http://47.238.251.227:50033/api-new/openwisp", {
            method: "get-config",
            payload: {}
          });
          this.config = response.data.data;
        } catch (error) {
          console.error("Error fetching config:", error);
        }
      },
      async setConfig() {
        try {
          const response = await axios.post("http://47.238.251.227:50033/api-new/openwisp", {
            method: "set-config",
            payload: this.config
          });
          if (response.data.code === 200) {
            alert("Configuration updated successfully!");
          } else {
            alert("Failed to update configuration.");
          }
        } catch (error) {
          console.error("Error setting config:", error);
        }
      }
    }
  };
  </script>
  
  <style>
  .container {
    max-width: 400px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  label {
    display: block;
    margin-top: 10px;
  }
  button {
    margin-top: 15px;
    padding: 10px;
    cursor: pointer;
  }
  </style>
  
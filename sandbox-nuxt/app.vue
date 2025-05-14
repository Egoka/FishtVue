<script setup lang="ts"></script>

<template>
  <div
    class="p-10 min-h-screen bg-gradient-to-r from-green-200 to-teal-500 flex flex-col items-center justify-center text-white">
    <div class="text-center">
      <h1 class="text-5xl font-bold mb-4">Welcome to FishtVue</h1>
      <p class="text-xl mb-8">Your new favorite UI library for Vue.js</p>
      <button class="bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition duration-300">
        Get Started
      </button>
    </div>
    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">Simplicity</h2>
        <p>Intuitive components that are easy to use and customize.</p>
      </div>
      <div class="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">Flexibility</h2>
        <p>Adapt components to your needs with minimal effort.</p>
      </div>
      <div class="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">Performance</h2>
        <p>Optimized components for maximum performance.</p>
      </div>
    </div>
  </div>
</template>

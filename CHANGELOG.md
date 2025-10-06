
---

## 🧠 Example Code for Modular Setup

### **main.js**
Handles initialization and animation.

```js
import { initScene, animate } from './SceneManager.js';
import { createParticles } from './Particles.js';

let sceneData;

try {
  sceneData = initScene();
  createParticles(sceneData.scene);
  animate(sceneData);
} catch (err) {
  console.error('Error initializing project:', err);
}





# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```
Getting started with 3D in React can feel like stepping into a different dimension—literally. It’s a powerful stack, but the syntax can be a bit cryptic at first.

Here is the breakdown of how to get these running and what that code actually means.

1. How to Install
To use these imports, you need to install three specific packages via your terminal. Run this command in your project folder:

Bash
npm install three @types/three @react-three/fiber @react-three/drei
What you are installing:
three: The core Three.js library (the engine).

@react-three/fiber: The "bridge" that lets React talk to Three.js.

@react-three/drei: A massive library of "helpers" (like pre-built cameras, loaders, and shapes) that save you from writing hundreds of lines of code.

useThree (from @react-three/fiber)
This is a Hook that gives you access to the "state" of your 3D world. It lets you grab the current camera, the size of the window, or the WebGL renderer.

Analogy: It’s like the "Settings" menu of your video game.

useGLTF (from @react-three/drei)
This is a specialized loader. Most 3D models online are .gltf or .glb files. This hook allows you to bring those files into your app with one line of code.

Analogy: It’s the "Import File" button for 3D objects.

Vector3 (from three)
This isn't a React tool; it's a Mathematical Class from the core Three.js library. In 3D space, almost everything (position, rotation, scale) is defined by three numbers: X, Y, and Z.

Example: new Vector3(1, 2, 3) represents a point in space.


Three.js	The Engine	The car's motor
Fiber	The Renderer	The steering wheel (how you control the motor with React)
Drei	The Toolbox	The GPS, Bluetooth, and Cup holders (extra features)

What it does: It tells npm to ignore the "Peer Dependency" warnings (the version conflicts) and install the packages anyway.

Is it safe? In the React Three Fiber ecosystem, the answer is usually yes. These packages often lag a few weeks behind the absolute newest React releases, but they still work perfectly fine.

npm ls react
npm ls @react-three/fiber

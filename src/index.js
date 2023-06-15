import * as webglUtils from "./webgl-utils.js";

const vs = `
  attribute vec3 a_position;
  attribute vec2 a_texcoord;
  attribute vec3 a_normal;

  uniform mat4 u_projection;
  uniform mat4 u_view;
  uniform mat4 u_world;

  varying vec3 v_normal;
  varying vec2 v_texcoord;
  varying vec3 v_vertPos;

  void main() 
  {
    vec4 position = u_projection * u_view * u_world * vec4(a_position, 1.0);

    gl_Position = position;
    
    v_normal = normalize(mat3(u_world) * a_normal);
    v_texcoord = a_texcoord;

    vec4 vertPos = u_view * vec4(a_position, 1.0);
    v_vertPos = vec3(vertPos) / vertPos.w;
  }
  `;

const fs = `
  precision mediump float;

  varying vec3 v_normal;
  varying vec2 v_texcoord;
  varying vec3 v_vertPos;  

  uniform vec3 u_lightDirection;
  uniform vec3 u_diffuseColor;
  
  uniform sampler2D uNormalMap;

  void main () 
  {
    float shininessVal = 10.0;
    float diffuseCoefficient = 1.0;
    float specularCoefficient = 1.0;
    float ambientCoefficient = 0.4;

    vec3 ambientColor = vec3(0.5, 0.2, 0.0);
    vec3 diffuseColor = u_diffuseColor;
    vec3 specularColor = vec3(1.0, 1.0, 1.0);

    vec3 normalMap = v_normal + texture2D(uNormalMap, v_texcoord).rgb;
    vec3 N = normalize(normalMap * 2.0 - 1.0);
    vec3 L = normalize(u_lightDirection);
    float lambertian = max(dot(N, L), 0.0);

    vec3 R = normalize(reflect(-L, N));
    vec3 V = normalize(-v_vertPos);
    float specularAngle = max(dot(R, V), 0.0);
    float specular = pow(specularAngle, shininessVal);

    vec3 diffuse = diffuseCoefficient * lambertian * diffuseColor;
    vec3 specularVector = specularCoefficient * specular * specularColor;
    vec3 ambient = ambientCoefficient * ambientColor;

    gl_FragColor = vec4(ambient + diffuse + specularVector, 1.0);
  }
  `;

const canvas = document.getElementById("orange");
initWebGl(canvas)
let border = 1.7;
let borderObj = 0.3;

// -- dog --
let u_worldDog = new Float32Array(16);
glMatrix.mat4.identity(u_worldDog);
glMatrix.mat4.rotate(u_worldDog, u_worldDog, radian(-90), [1, 0, 0]);
glMatrix.mat4.translate(u_worldDog, u_worldDog, [0.0, -0.2, 0.0]);
let curDirDog = "Up";

// -- lamp --
let u_worldLamp = new Float32Array(16);
glMatrix.mat4.identity(u_worldLamp);
// glMatrix.mat4.rotate(u_worldLamp, u_worldLamp, radian(10), [1, 0, 0]);
glMatrix.mat4.rotate(u_worldLamp, u_worldLamp, radian(225), [0, 1, 0]);
glMatrix.mat4.translate(u_worldLamp, u_worldLamp, [1.2, 0.0, 0.0]);

// -- cat --
let u_worldCat = new Float32Array(16);
glMatrix.mat4.identity(u_worldCat);
glMatrix.mat4.rotate(u_worldCat, u_worldCat, radian(-90), [1, 0, 0]);
glMatrix.mat4.rotate(u_worldCat, u_worldCat, radian(-135), [0, 0, 1]);
glMatrix.mat4.translate(u_worldCat, u_worldCat, [0.0, 1.2, 0.0]);

// -- mower --
let u_worldMower = new Float32Array(16);
glMatrix.mat4.identity(u_worldMower);
glMatrix.mat4.rotate(u_worldMower, u_worldMower, radian(-90), [1, 0, 0]);
glMatrix.mat4.rotate(u_worldMower, u_worldMower, radian(-180), [0, 0, 1]);
glMatrix.mat4.translate(u_worldMower, u_worldMower, [0.0, 0.95, 0.0]);

// -- mower2 --
let u_worldMower2 = new Float32Array(16);
glMatrix.mat4.identity(u_worldMower2);
glMatrix.mat4.rotate(u_worldMower2, u_worldMower2, radian(-90), [1, 0, 0]);
glMatrix.mat4.rotate(u_worldMower2, u_worldMower2, radian(-180), [0, 0, 1]);
glMatrix.mat4.translate(u_worldMower2, u_worldMower2, [0.0, -0.85, 0.0]);

let meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

document.addEventListener('keydown', (event) => {
  let key = event.key;
  let old12 = u_worldDog[12];
  let old14 = u_worldDog[14];
  let speed = 0.04;

  if (key == "ArrowLeft")
  {
    switch(curDirDog){
      case 'Up':
        glMatrix.mat4.rotate(u_worldDog, u_worldDog, radian(90), [0, 0, 1]);
        break
      case 'Down':
        glMatrix.mat4.rotate(u_worldDog, u_worldDog, radian(-90), [0, 0, 1]);
        break
      case 'Right':
        glMatrix.mat4.rotate(u_worldDog, u_worldDog, radian(180), [0, 0, 1]);
        break
    }
    curDirDog = "Left"
    glMatrix.mat4.translate(u_worldDog, u_worldDog, [0.0, -speed, 0.0]);
  }
  else if (key == "ArrowRight")
  {
    switch(curDirDog){
      case 'Up':
        glMatrix.mat4.rotate(u_worldDog, u_worldDog, radian(-90), [0, 0, 1]);
        break
      case 'Down':
        glMatrix.mat4.rotate(u_worldDog, u_worldDog, radian(90), [0, 0, 1]);
        break
      case 'Left':
        glMatrix.mat4.rotate(u_worldDog, u_worldDog, radian(180), [0, 0, 1]);
        break
    }
    curDirDog = "Right"
    glMatrix.mat4.translate(u_worldDog, u_worldDog, [0.0, -speed, 0.0]);
  }
  else if (key == "ArrowUp")
  {
    switch(curDirDog){
      case 'Right':
        glMatrix.mat4.rotate(u_worldDog, u_worldDog, radian(90), [0, 0, 1]);
        break
      case 'Down':
        glMatrix.mat4.rotate(u_worldDog, u_worldDog, radian(180), [0, 0, 1]);
        break
      case 'Left':
        glMatrix.mat4.rotate(u_worldDog, u_worldDog, radian(-90), [0, 0, 1]);
        break
    }
    curDirDog = "Up"
    glMatrix.mat4.translate(u_worldDog, u_worldDog, [0.0, -speed, 0.0]);
  }
  else if(key == "ArrowDown")
  {
    switch(curDirDog){
      case 'Right':
        glMatrix.mat4.rotate(u_worldDog, u_worldDog, radian(-90), [0, 0, 1]);
        break
      case 'Up':
        glMatrix.mat4.rotate(u_worldDog, u_worldDog, radian(180), [0, 0, 1]);
        break
      case 'Left':
        glMatrix.mat4.rotate(u_worldDog, u_worldDog, radian(90), [0, 0, 1]);
        break
    }
    curDirDog = "Down"

    glMatrix.mat4.translate(u_worldDog, u_worldDog, [0.0, -speed, 0.0]);
  }

  if (u_worldDog[14] > border)
  {
    u_worldDog[14] = border;
  }
  if (u_worldDog[14] < -border + 0.9)
  {
    u_worldDog[14] = -border + 0.9;
  }
  if (u_worldDog[12] > border)
  {
    u_worldDog[12] = border;
  }
  if (u_worldDog[12] < -border)
  {
    u_worldDog[12] = -border;
  }
  
  if (u_worldDog[14] >= u_worldCat[14] - borderObj && u_worldDog[14] <= u_worldCat[14] + borderObj && u_worldDog[12] >= u_worldCat[12] - borderObj && u_worldDog[12] <= u_worldCat[12] + borderObj)
  {
    u_worldDog[14] = old14;
    u_worldDog[12] = old12;
  }

  if (u_worldDog[14] >= u_worldLamp[14] - borderObj && u_worldDog[14] <= u_worldLamp[14] + borderObj && u_worldDog[12] >= u_worldLamp[12] - borderObj && u_worldDog[12] <= u_worldLamp[12] + borderObj)
  {
    u_worldDog[14] = old14;
    u_worldDog[12] = old12;
  }
}, false);

async function main() {

    // -- grass --
    const responseGrass = await fetch('src/grass.obj');
    const objGrass = await responseGrass.text();

    const bufferGrass = parseObjFile(objGrass, 80);

    const bufferInfoGrass = webglUtils.createBufferInfoFromArrays(gl, bufferGrass);

    // -- dog --
    const responseDog = await fetch('src/dog.obj');
    const objDog = await responseDog.text();

    const bufferDog = parseObjFile(objDog, 100);

    const bufferInfoDog = webglUtils.createBufferInfoFromArrays(gl, bufferDog);

    // -- lamp --
    const responseLamp = await fetch('src/lamp.obj');
    const objLamp = await responseLamp.text();

    const bufferLamp = parseObjFile(objLamp, 600);

    const bufferInfoLamp = webglUtils.createBufferInfoFromArrays(gl, bufferLamp);

    // -- cat --
    const responseCat = await fetch('src/cat.obj');
    const objCat = await responseCat.text();

    const bufferCat = parseObjFile(objCat, 200);

    const bufferInfoCat = webglUtils.createBufferInfoFromArrays(gl, bufferCat);

    // -- mower --
    const responseMower = await fetch('src/mower.obj');
    const objMower = await responseMower.text();

    const bufferMower = parseObjFile(objMower, 400);

    const bufferInfoMower = webglUtils.createBufferInfoFromArrays(gl, bufferMower);

    // -- mower2 --
    const responseMower2 = await fetch('src/mower.obj');
    const objMower2 = await responseMower2.text();

    const bufferMower2 = parseObjFile(objMower2, 400);

    const bufferInfoMower2 = webglUtils.createBufferInfoFromArrays(gl, bufferMower2);

    let mapTexture = getTexture("src//grass.png")
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, mapTexture);

    let lightDir = [1, 1, 1];
    let u_world = new Float32Array(16);
    glMatrix.mat4.identity(u_world);

    const pos = [0, 2, -1];
    const view = [0, 0, 1];

    let camera = new Float32Array(16);
    glMatrix.mat4.lookAt(camera, pos, view, [0, 1, 0]);

    let projection = new Float32Array(16);
    glMatrix.mat4.perspective(projection, radian(90), gl.canvas.clientWidth / gl.canvas.clientHeight, 0.0, 1);
    
    glMatrix.mat4.rotate(u_world, u_world, radian(-90), [1, 0, 0]);

    let mapTextureSteel = getTexture("src//steel.png")
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, mapTextureSteel);

    let color = [1.0, 1.0, 1.0]
    let numMoves = 0
    let numMoves2 = 0
    let speed1 = 0;
    let speed2 = 0;
    let animate = function render(time) {

        gl.enable(gl.CULL_FACE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(meshProgramInfo.program);

        // -- grass --

        webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfoGrass);

        let speed = 0.0
        glMatrix.mat4.rotate(u_world, u_world, radian(speed), [1, 1, 0]);
        color = [0.0, 0.5, 0.0]

        webglUtils.setUniforms(meshProgramInfo, {
            u_lightDirection: lightDir,
            u_view: camera,
            u_diffuseColor: color,
            u_projection: projection,
            u_world: u_world,
            uNormalMap: mapTexture,
        });

        webglUtils.drawBufferInfo(gl, bufferInfoGrass);

        // -- dog --

        webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfoDog);

        glMatrix.mat4.rotate(u_world, u_world, radian(speed), [1, 1, 0]);
        color = [0.545, 0.27, 0.0745]

        webglUtils.setUniforms(meshProgramInfo, {
            u_lightDirection: lightDir,
            u_view: camera,
            u_diffuseColor: color,
            u_projection: projection,
            u_world: u_worldDog,
            uNormalMap: mapTexture,
        });

        webglUtils.drawBufferInfo(gl, bufferInfoDog);

        // -- lamp --

        webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfoLamp);

        glMatrix.mat4.rotate(u_world, u_world, radian(speed), [1, 1, 0]);
        color = [0.67, 0.67, 0.67]

        webglUtils.setUniforms(meshProgramInfo, {
            u_lightDirection: lightDir,
            u_view: camera,
            u_diffuseColor: color,
            u_projection: projection,
            u_world: u_worldLamp,
            uNormalMap: mapTextureSteel,
        });

        webglUtils.drawBufferInfo(gl, bufferInfoLamp);

        // -- cat --

        webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfoCat);

        glMatrix.mat4.rotate(u_world, u_world, radian(speed), [1, 1, 0]);
        color = [0.6275, 0.6275, 0.6275]

        webglUtils.setUniforms(meshProgramInfo, {
            u_lightDirection: lightDir,
            u_view: camera,
            u_diffuseColor: color,
            u_projection: projection,
            u_world: u_worldCat,
            uNormalMap: mapTexture,
        });

        webglUtils.drawBufferInfo(gl, bufferInfoCat);

        // -- mower --

        webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfoMower);

        // console.log(Math.floor(Math.random() * 4))
        if (numMoves == 0)
        {
          numMoves = 1150;
          let dir = Math.floor(Math.random() * 360);
          speed1 = Math.random() / 200;
          console.log("new")
          glMatrix.mat4.rotate(u_worldMower, u_worldMower, radian(dir), [0, 0, 1]);
        }
        numMoves--;

        if (u_worldMower[14] > border)
        {
          u_worldMower[14] = border;
          glMatrix.mat4.rotate(u_worldMower, u_worldMower, radian(180), [0, 0, 1]);
        }
        if (u_worldMower[14] < -border + 0.9)
        {
          u_worldMower[14] = -border + 0.9;
          glMatrix.mat4.rotate(u_worldMower, u_worldMower, radian(180), [0, 0, 1]);
        }
        if (u_worldMower[12] > border)
        {
          u_worldMower[12] = border;
          glMatrix.mat4.rotate(u_worldMower, u_worldMower, radian(180), [0, 0, 1]);
        }
        if (u_worldMower[12] < -border)
        {
          u_worldMower[12] = -border;
          glMatrix.mat4.rotate(u_worldMower, u_worldMower, radian(180), [0, 0, 1]);
        }

        if (u_worldMower[14] >= u_worldCat[14] - borderObj && u_worldMower[14] <= u_worldCat[14] + borderObj && u_worldMower[12] >= u_worldCat[12] - borderObj && u_worldMower[12] <= u_worldCat[12] + borderObj)
        {
          glMatrix.mat4.rotate(u_worldMower, u_worldMower, radian(180), [0, 0, 1]);
        }

        if (u_worldMower[14] >= u_worldLamp[14] - borderObj && u_worldMower[14] <= u_worldLamp[14] + borderObj && u_worldMower[12] >= u_worldLamp[12] - borderObj && u_worldMower[12] <= u_worldLamp[12] + borderObj)
        {
          glMatrix.mat4.rotate(u_worldMower, u_worldMower, radian(180), [0, 0, 1]);
        }

        if (u_worldMower[14] >= u_worldDog[14] - borderObj && u_worldMower[14] <= u_worldDog[14] + borderObj && u_worldMower[12] >= u_worldDog[12] - borderObj && u_worldMower[12] <= u_worldDog[12] + borderObj)
        {
          alert("You lose!");
          u_worldDog[14] = 0.0;
          u_worldDog[12] = 0.0;
          u_worldMower[14] = 1.0;
          u_worldMower[12] = 0.0;
          u_worldMower2[14] = -0.9;
          u_worldMower2[12] = 0.0;
          glMatrix.mat4.rotate(u_worldMower2, u_worldMower2, radian(30), [0, 0, 1]);
          glMatrix.mat4.rotate(u_worldMower, u_worldMower, radian(30), [0, 0, 1]);
        }
        
        glMatrix.mat4.translate(u_worldMower, u_worldMower, [0.004 + speed1, 0.0, 0.0]);

        glMatrix.mat4.rotate(u_world, u_world, radian(speed), [1, 1, 0]);
        color = [0.5, 0.0, 0.0]

        webglUtils.setUniforms(meshProgramInfo, {
            u_lightDirection: lightDir,
            u_view: camera,
            u_diffuseColor: color,
            u_projection: projection,
            u_world: u_worldMower,
            uNormalMap: mapTextureSteel,
        });

        webglUtils.drawBufferInfo(gl, bufferInfoMower);

        // -- mower2 --

        webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfoMower);

        // console.log(Math.floor(Math.random() * 4))
        if (numMoves2 == 0)
        {
          numMoves2 = 900;
          let dir = Math.floor(Math.random() * 360);
          speed2 = Math.random() / 200;
          console.log("new")
          glMatrix.mat4.rotate(u_worldMower2, u_worldMower2, radian(dir), [0, 0, 1]);
        }
        numMoves2--;

        if (u_worldMower2[14] > border)
        {
          u_worldMower2[14] = border;
          glMatrix.mat4.rotate(u_worldMower2, u_worldMower2, radian(180), [0, 0, 1]);
        }
        if (u_worldMower2[14] < -border + 0.9)
        {
          u_worldMower2[14] = -border + 0.9;
          glMatrix.mat4.rotate(u_worldMower2, u_worldMower2, radian(180), [0, 0, 1]);
        }
        if (u_worldMower2[12] > border)
        {
          u_worldMower2[12] = border;
          glMatrix.mat4.rotate(u_worldMower2, u_worldMower2, radian(180), [0, 0, 1]);
        }
        if (u_worldMower2[12] < -border)
        {
          u_worldMower2[12] = -border;
          glMatrix.mat4.rotate(u_worldMower2, u_worldMower2, radian(180), [0, 0, 1]);
        }

        if (u_worldMower2[14] >= u_worldCat[14] - borderObj && u_worldMower2[14] <= u_worldCat[14] + borderObj && u_worldMower2[12] >= u_worldCat[12] - borderObj && u_worldMower2[12] <= u_worldCat[12] + borderObj)
        {
          glMatrix.mat4.rotate(u_worldMower2, u_worldMower2, radian(180), [0, 0, 1]);
        }

        if (u_worldMower2[14] >= u_worldLamp[14] - borderObj && u_worldMower2[14] <= u_worldLamp[14] + borderObj && u_worldMower2[12] >= u_worldLamp[12] - borderObj && u_worldMower2[12] <= u_worldLamp[12] + borderObj)
        {
          glMatrix.mat4.rotate(u_worldMower2, u_worldMower2, radian(180), [0, 0, 1]);
        }

        if (u_worldMower2[14] >= u_worldMower[14] - borderObj && u_worldMower2[14] <= u_worldMower[14] + borderObj && u_worldMower2[12] >= u_worldMower[12] - borderObj && u_worldMower2[12] <= u_worldMower[12] + borderObj)
        {
          glMatrix.mat4.rotate(u_worldMower2, u_worldMower2, radian(180), [0, 0, 1]);
          glMatrix.mat4.rotate(u_worldMower, u_worldMower, radian(180), [0, 0, 1]);
        }

        if (u_worldMower2[14] >= u_worldDog[14] - borderObj && u_worldMower2[14] <= u_worldDog[14] + borderObj && u_worldMower2[12] >= u_worldDog[12] - borderObj && u_worldMower2[12] <= u_worldDog[12] + borderObj)
        {
          alert("You lose!");
          u_worldDog[14] = 0.0;
          u_worldDog[12] = 0.0;
          u_worldMower2[14] = -0.9;
          u_worldMower2[12] = 0.0;
          u_worldMower[14] = 1.0;
          u_worldMower[12] = 0.0;
          glMatrix.mat4.rotate(u_worldMower2, u_worldMower2, radian(30), [0, 0, 1]);
          glMatrix.mat4.rotate(u_worldMower, u_worldMower, radian(30), [0, 0, 1]);
        }
        
        glMatrix.mat4.translate(u_worldMower2, u_worldMower2, [0.004 + speed2, 0.0, 0.0]);

        glMatrix.mat4.rotate(u_world, u_world, radian(speed), [1, 1, 0]);
        color = [0.2, 0.0, 0.0]

        webglUtils.setUniforms(meshProgramInfo, {
            u_lightDirection: lightDir,
            u_view: camera,
            u_diffuseColor: color,
            u_projection: projection,
            u_world: u_worldMower2,
            uNormalMap: mapTextureSteel,
        });

        webglUtils.drawBufferInfo(gl, bufferInfoMower2);

        window.requestAnimationFrame(animate);
    }

    animate(0);
}

main();
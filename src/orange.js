let gl = null;

function initWebGl(canvas) {
    gl = canvas.getContext("webgl");

    gl.clearColor(0.8392, 0.9333, 0.9725, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function radian(deg) {
    return deg * Math.PI / 180;
}

function processTexture(img, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
}

function getTexture(img) {
    let texture = gl.createTexture();
    let image = new Image();
    
    image.onload = function () {
        processTexture(image, texture);
    }

    image.src = img;
    return texture
}

function parseObjFile(text, num) {
  // because indices are base 1 let's just fill in the 0th data
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0, 0]];
  const objNormals = [[0, 0, 0]];

  // same order as `f` indices
  const objVertexData = [
      objPositions,
      objTexcoords,
      objNormals,
  ];

  // same order as `f` indices
  let webglVertexData = [
      [],   // positions
      [],   // texcoords
      [],   // normals
  ];

  function newGeometry() {
      // If there is an existing geometry and it's
      // not empty then start a new one.
      if (geometry && geometry.data.position.length) {
          geometry = undefined;
      }
      setGeometry();
  }

  function addVertex(vert) {
      const ptn = vert.split('/');
      ptn.forEach((objIndexStr, i) => {
          if (!objIndexStr) {
              return;
          }
          const objIndex = parseInt(objIndexStr);
          const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
          webglVertexData[i].push(...objVertexData[i][index]);
      });
  }

  const keywords = {
      v(parts) {
          objPositions.push(parts.map(parseFloat));
      },
      vn(parts) {
          objNormals.push(parts.map(parseFloat));
      },
      vt(parts) {

          // should check for missing v and extra w?
          objTexcoords.push(parts.map(parseFloat).slice(0,2));
      },
      f(parts) {
          const numTriangles = parts.length - 2;
          for (let tri = 0; tri < numTriangles; ++tri) {
              addVertex(parts[0]);
              addVertex(parts[tri + 1]);
              addVertex(parts[tri + 2]);
          }
      },
  };

  const keywordRE = /(\w*)(?: )*(.*)/;
  const lines = text.split('\n');
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
      const line = lines[lineNo].trim();
      if (line === '' || line.startsWith('#')) {
          continue;
      }
      const m = keywordRE.exec(line);
      if (!m) {
          continue;
      }
      const [, keyword, unparsedArgs] = m;
      const parts = line.split(/\s+/).slice(1);
      const handler = keywords[keyword];
      if (!handler) {
          console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
          continue;
      }
      handler(parts, unparsedArgs);
  }

  for (let i = 0; i < webglVertexData[0].length; ++i)
  {
    webglVertexData[0][i] = webglVertexData[0][i] / num
  }

  return {
      position: webglVertexData[0],
      texcoord: webglVertexData[1],
      normal: webglVertexData[2],
  };
}

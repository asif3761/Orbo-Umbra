/* ---------------- CINEMATIC 3D HERO: PBR + shader cloak + hand-rolled bloom ---------------- */
(function(){
  const container = document.getElementById('blade-canvas');
  if(typeof THREE === 'undefined' || !window.WebGLRenderingContext){ return; }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer:coarse)').matches;

  let renderer;
  try{
    renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'high-performance' });
  }catch(e){ return; }

  const pr = Math.min(window.devicePixelRatio || 1, isCoarse ? 1.5 : 2);
  renderer.setPixelRatio(pr);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0705, 0.05);

  const camera = new THREE.PerspectiveCamera(34, container.clientWidth/container.clientHeight, 0.1, 60);
  camera.position.set(0.4, 1.5, 8.2);
  camera.lookAt(0, 0.6, 0);

  /* ---- procedural night backdrop (canvas texture, no network) ---- */
  function makeSkyTexture(){
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0,0,0,512);
    g.addColorStop(0, '#0a0805'); g.addColorStop(0.55, '#160f0a'); g.addColorStop(1, '#221708');
    ctx.fillStyle = g; ctx.fillRect(0,0,512,512);
    // moon glow
    const mg = ctx.createRadialGradient(380,140,0,380,140,220);
    mg.addColorStop(0,'rgba(253,248,236,0.9)'); mg.addColorStop(0.25,'rgba(232,220,192,0.35)'); mg.addColorStop(1,'rgba(232,220,192,0)');
    ctx.fillStyle = mg; ctx.fillRect(0,0,512,512);
    ctx.beginPath(); ctx.arc(380,140,44,0,Math.PI*2); ctx.fillStyle = '#f6efd9'; ctx.fill();
    // stars
    for(let i=0;i<140;i++){
      ctx.globalAlpha = Math.random()*0.8+0.2;
      ctx.fillStyle = '#e8dcc0';
      ctx.fillRect(Math.random()*512, Math.random()*300, 1.2, 1.2);
    }
    ctx.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }
  scene.background = makeSkyTexture();

  /* ---- environment reflections (PMREM from a simple procedural sky, no HDR file needed) ---- */
  let envRT = null;
  try{
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envScene = new THREE.Scene();
    const envMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms:{ top:{value:new THREE.Color(0x2a2015)}, bottom:{value:new THREE.Color(0x000000)}, moon:{value:new THREE.Color(0xfdf1d8)} },
      vertexShader:`varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader:`varying vec3 vP; uniform vec3 top; uniform vec3 bottom; uniform vec3 moon;
        void main(){
          float h = normalize(vP).y*0.5+0.5;
          vec3 col = mix(bottom, top, h);
          float m = smoothstep(0.985,1.0, dot(normalize(vP), normalize(vec3(0.55,0.5,-0.6))));
          col += m*moon*2.5;
          gl_FragColor = vec4(col,1.0);
        }`
    });
    envScene.add(new THREE.Mesh(new THREE.SphereGeometry(20,24,24), envMat));
    envRT = pmrem.fromScene(envScene, 0.05);
    scene.environment = envRT.texture;
    pmrem.dispose();
  }catch(e){ /* environment reflections unsupported — proceed without them */ }

  /* ---- lighting ---- */
  scene.add(new THREE.AmbientLight(0x2a1f14, 0.55));
  const moonLight = new THREE.DirectionalLight(0xe8dcc0, 2.0);
  moonLight.position.set(3.5, 6, -2.5);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024,1024);
  moonLight.shadow.camera.near = 1; moonLight.shadow.camera.far = 18;
  moonLight.shadow.camera.left = -6; moonLight.shadow.camera.right = 6;
  moonLight.shadow.camera.top = 6; moonLight.shadow.camera.bottom = -6;
  moonLight.shadow.bias = -0.002;
  moonLight.shadow.camera.updateProjectionMatrix();
  scene.add(moonLight);
  const rimLight = new THREE.PointLight(0x7c2626, 3.2, 14, 2);
  rimLight.position.set(-2.6, 1.4, 2.6);
  scene.add(rimLight);
  const kickLight = new THREE.PointLight(0xd3a862, 2.4, 12, 2);
  kickLight.position.set(1.8, 0.4, 3.2);
  scene.add(kickLight);

  /* ---- ground / ledge ---- */
  const ledge = new THREE.Mesh(
    new THREE.BoxGeometry(24, 0.6, 6),
    new THREE.MeshStandardMaterial({ color:0x0e0a06, roughness:0.95, metalness:0.02 })
  );
  ledge.position.y = -1.35;
  ledge.receiveShadow = true;
  scene.add(ledge);

  /* ---- distant rooftop silhouettes with lit windows (bloom-friendly emissive) ---- */
  const cityGroup = new THREE.Group();
  const cityMat = new THREE.MeshBasicMaterial({ color:0x0a0704 });
  const winMat = new THREE.MeshBasicMaterial({ color:0xffdca0, toneMapped:false });
  for(let i=0;i<9;i++){
    const w = 0.7+Math.random()*0.9, h = 1+Math.random()*2.4, d = 0.7+Math.random()*0.9;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), cityMat);
    b.position.set(-8 + i*2 + (Math.random()-0.5), h/2 - 1.35, -6 - Math.random()*3);
    cityGroup.add(b);
    if(Math.random() > 0.4){
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.08,0.12), winMat);
      win.position.set(b.position.x + (Math.random()-0.5)*w*0.6, b.position.y, b.position.z + d/2 + 0.01);
      cityGroup.add(win);
    }
  }
  scene.add(cityGroup);

  /* ---- the figure ---- */
  const figure = new THREE.Group();
  figure.position.set(0.3, -1.05, 0.6);
  scene.add(figure);

  const skinDark = new THREE.MeshStandardMaterial({ color:0x0d0906, roughness:0.85, metalness:0.05, envMapIntensity:0.6 });

  // torso built as cylinder + two spherical caps (THREE.CapsuleGeometry doesn't exist in r128)
  const torsoBody = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.9, 12), skinDark);
  torsoBody.position.y = 1.1; torsoBody.castShadow = true;
  figure.add(torsoBody);
  const torsoCapTop = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 12), skinDark);
  torsoCapTop.position.y = 1.55; torsoCapTop.castShadow = true;
  figure.add(torsoCapTop);
  const torsoCapBottom = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), skinDark);
  torsoCapBottom.position.y = 0.65; torsoCapBottom.castShadow = true;
  figure.add(torsoCapBottom);

  const hood = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.6, 16, 1, true), skinDark);
  hood.position.y = 1.85; hood.castShadow = true;
  figure.add(hood);
  const hoodCap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), skinDark);
  hoodCap.position.y = 1.95;
  figure.add(hoodCap);

  // cloak: subdivided plane, tapered + curved, with a live shader-driven cloth wave
  const cloakGeo = new THREE.PlaneGeometry(1.5, 2.3, 18, 26);
  const posAttr = cloakGeo.attributes.position;
  for(let i=0;i<posAttr.count;i++){
    const x = posAttr.getX(i), y = posAttr.getY(i);
    const t = (y + 1.15) / 2.3; // 0 at bottom .. 1 at top
    const taper = 0.35 + t*0.65; // narrower at top
    const curve = Math.pow(1-t, 1.6) * 0.35; // billow outward toward the bottom
    posAttr.setX(i, x*taper);
    posAttr.setZ(i, -curve);
  }
  cloakGeo.computeVertexNormals();
  const cloakMat = new THREE.MeshStandardMaterial({
    color:0x120d09, roughness:0.85, metalness:0.08, envMapIntensity:0.5,
    side:THREE.DoubleSide
  });
  cloakMat.onBeforeCompile = (shader)=>{
    shader.uniforms.uTime = { value:0 };
    shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       float windT = (position.y + 1.15) / 2.3;
       float sway = sin(uTime*1.6 + position.x*2.2) * 0.09 * pow(1.0-windT, 2.0);
       float flutter = sin(uTime*3.1 + position.y*3.0) * 0.03 * pow(1.0-windT, 2.5);
       transformed.x += sway;
       transformed.z += flutter;`
    );
    cloakMat.userData.shader = shader;
  };
  const cloak = new THREE.Mesh(cloakGeo, cloakMat);
  cloak.position.set(0, 1.55, -0.28);
  cloak.castShadow = true;
  figure.add(cloak);

  // rim-light accent along the hood edge
  const rimEdge = new THREE.Mesh(
    new THREE.TorusGeometry(0.25, 0.012, 8, 24, Math.PI*0.7),
    new THREE.MeshStandardMaterial({ color:0xa9803f, emissive:0x3a2a10, roughness:0.3, metalness:0.8 })
  );
  rimEdge.position.set(0.02, 1.9, 0.18);
  rimEdge.rotation.set(0.3, 0.9, 0);
  figure.add(rimEdge);

  // extended arm + hidden blade
  const armGroup = new THREE.Group();
  armGroup.position.set(0.3, 1.35, 0.15);
  armGroup.rotation.z = -0.55;
  armGroup.rotation.y = 0.35;
  figure.add(armGroup);

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.11,0.85,10), skinDark);
  arm.position.y = 0.42; arm.castShadow = true;
  armGroup.add(arm);

  const gauntlet = new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.12,0.22,10),
    new THREE.MeshStandardMaterial({ color:0x3a281c, roughness:0.8, metalness:0.15 }));
  gauntlet.position.y = 0.82;
  armGroup.add(gauntlet);

  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0,0); bladeShape.lineTo(0.05,0.02); bladeShape.lineTo(0.02,0.78);
  bladeShape.lineTo(0,0.85); bladeShape.lineTo(-0.02,0.78); bladeShape.lineTo(-0.05,0.02); bladeShape.lineTo(0,0);
  const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth:0.012, bevelEnabled:true, bevelThickness:0.004, bevelSize:0.004, bevelSegments:2 });
  const bladeMat = new THREE.MeshPhysicalMaterial({
    color:0xd9d3c6, metalness:1.0, roughness:0.14, clearcoat:0.6, clearcoatRoughness:0.2, envMapIntensity:1.6
  });
  const blade = new THREE.Mesh(bladeGeo, bladeMat);
  blade.position.y = 0.95; blade.castShadow = true;
  armGroup.add(blade);

  // glint sprite on the blade edge (canvas-generated soft streak, additive)
  function makeGlowTexture(){
    const c = document.createElement('canvas'); c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.4,'rgba(253,248,236,0.55)'); g.addColorStop(1,'rgba(253,248,236,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,64,64);
    return new THREE.CanvasTexture(c);
  }
  const glowTex = makeGlowTexture();
  const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:0xfdf8ec, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false }));
  glint.scale.set(0.22,0.22,1);
  glint.position.set(0, 1.3, 0.02);
  armGroup.add(glint);

  // moon halo + window glows as additive sprites (cheap, robust "bloom")
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:0xf6efd9, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, opacity:0.5 }));
  halo.scale.set(5,5,1);
  halo.position.set(2.6, 3.2, -8);
  scene.add(halo);

  /* ---- embers (GPU points, soft glow sprite, additive) ---- */
  const EMBER_COUNT = isCoarse ? 40 : 90;
  const emberGeo = new THREE.BufferGeometry();
  const emberPos = new Float32Array(EMBER_COUNT*3);
  const emberSpeed = new Float32Array(EMBER_COUNT);
  for(let i=0;i<EMBER_COUNT;i++){
    emberPos[i*3]   = (Math.random()-0.5)*9;
    emberPos[i*3+1] = -1.3 + Math.random()*3.5;
    emberPos[i*3+2] = (Math.random()-0.5)*5 + 1;
    emberSpeed[i] = 0.15 + Math.random()*0.35;
  }
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos,3));
  const emberMat = new THREE.PointsMaterial({
    size:0.06, map:glowTex, color:0xd3a862, transparent:true, opacity:0.85,
    blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true
  });
  const embers = new THREE.Points(emberGeo, emberMat);
  scene.add(embers);

  /* ---- hand-rolled bloom post-process (bright-pass + blur + composite), with safe fallback ---- */
  let bloomOK = true;
  let sceneRT, brightRT, pingRT, pongRT;
  const fsScene = new THREE.Scene();
  const fsCam = new THREE.Camera();
  const fsGeo = new THREE.PlaneGeometry(2,2);
  const fsVert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.0,1.0); }`;
  const brightMat = new THREE.ShaderMaterial({
    uniforms:{ tDiffuse:{value:null}, uThreshold:{value:0.72} },
    vertexShader:fsVert,
    fragmentShader:`varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uThreshold;
      void main(){
        vec4 t = texture2D(tDiffuse, vUv);
        float lum = dot(t.rgb, vec3(0.2126,0.7152,0.0722));
        float f = smoothstep(uThreshold, uThreshold+0.3, lum);
        gl_FragColor = vec4(t.rgb*f, 1.0);
      }`
  });
  const blurMat = new THREE.ShaderMaterial({
    uniforms:{ tDiffuse:{value:null}, uDir:{value:new THREE.Vector2(1,0)} },
    vertexShader:fsVert,
    fragmentShader:`varying vec2 vUv; uniform sampler2D tDiffuse; uniform vec2 uDir;
      void main(){
        vec4 sum = texture2D(tDiffuse, vUv) * 0.227027;
        vec2 o1 = uDir * 1.3846; vec2 o2 = uDir * 3.2307;
        sum += texture2D(tDiffuse, vUv+o1) * 0.3162162;
        sum += texture2D(tDiffuse, vUv-o1) * 0.3162162;
        sum += texture2D(tDiffuse, vUv+o2) * 0.0702703;
        sum += texture2D(tDiffuse, vUv-o2) * 0.0702703;
        gl_FragColor = sum;
      }`
  });
  const compMat = new THREE.ShaderMaterial({
    uniforms:{ tScene:{value:null}, tBloom:{value:null}, uBloom:{value:0.85} },
    vertexShader:fsVert,
    fragmentShader:`varying vec2 vUv; uniform sampler2D tScene; uniform sampler2D tBloom; uniform float uBloom;
      void main(){
        vec3 col = texture2D(tScene, vUv).rgb + texture2D(tBloom, vUv).rgb * uBloom;
        vec2 c = vUv - 0.5;
        float vig = smoothstep(0.85, 0.25, length(c)*1.15);
        col *= mix(0.82, 1.0, vig);
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  const fsQuad = new THREE.Mesh(fsGeo, brightMat);
  fsScene.add(fsQuad);

  function buildTargets(w,h){
    const opts = { minFilter:THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat };
    sceneRT && sceneRT.dispose(); brightRT && brightRT.dispose(); pingRT && pingRT.dispose(); pongRT && pongRT.dispose();
    sceneRT = new THREE.WebGLRenderTarget(w, h, opts);
    sceneRT.texture.encoding = THREE.sRGBEncoding;
    const bw = Math.max(2, Math.floor(w/2)), bh = Math.max(2, Math.floor(h/2));
    brightRT = new THREE.WebGLRenderTarget(bw, bh, opts);
    pingRT = new THREE.WebGLRenderTarget(bw, bh, opts);
    pongRT = new THREE.WebGLRenderTarget(bw, bh, opts);
  }
  try{
    buildTargets(container.clientWidth, container.clientHeight);
  }catch(e){ bloomOK = false; }

  function renderBloom(){
    // 1. main scene
    renderer.setRenderTarget(sceneRT);
    renderer.render(scene, camera);

    // 2. bright pass -> brightRT
    fsQuad.material = brightMat;
    brightMat.uniforms.tDiffuse.value = sceneRT.texture;
    renderer.setRenderTarget(brightRT);
    renderer.render(fsScene, fsCam);

    // 3. blur (2 passes h/v) ping-ponging
    fsQuad.material = blurMat;
    blurMat.uniforms.tDiffuse.value = brightRT.texture;
    blurMat.uniforms.uDir.value.set(1.2/brightRT.width, 0);
    renderer.setRenderTarget(pingRT);
    renderer.render(fsScene, fsCam);

    blurMat.uniforms.tDiffuse.value = pingRT.texture;
    blurMat.uniforms.uDir.value.set(0, 1.2/brightRT.height);
    renderer.setRenderTarget(pongRT);
    renderer.render(fsScene, fsCam);

    // 4. composite -> screen
    fsQuad.material = compMat;
    compMat.uniforms.tScene.value = sceneRT.texture;
    compMat.uniforms.tBloom.value = pongRT.texture;
    renderer.setRenderTarget(null);
    renderer.render(fsScene, fsCam);
  }

  /* ---- cinematic camera: gentle auto-drift + mouse parallax + scroll dolly ---- */
  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  container.addEventListener('mousemove', (e)=>{
    const r = container.getBoundingClientRect();
    targetX = ((e.clientX - r.left)/r.width - 0.5)*2;
    targetY = ((e.clientY - r.top)/r.height - 0.5)*2;
  });
  container.addEventListener('mouseleave', ()=>{ targetX = 0; targetY = 0; });

  const baseCamPos = camera.position.clone();
  const clock = new THREE.Clock();

  function frame(){
    requestAnimationFrame(frame);
    try{
      const t = clock.getElapsedTime();
      const scrollT = Math.min(1, window.scrollY / (window.innerHeight*0.9));

      if(!reduced){
        curX += (targetX - curX) * 0.05;
        curY += (targetY - curY) * 0.05;

        camera.position.x = baseCamPos.x + curX*0.5 + Math.sin(t*0.12)*0.15;
        camera.position.y = baseCamPos.y + curY*0.25 + Math.sin(t*0.18)*0.08;
        camera.position.z = baseCamPos.z + scrollT*2.2;
        camera.lookAt(0, 0.6 - scrollT*0.3, 0);

        if(cloakMat.userData.shader) cloakMat.userData.shader.uniforms.uTime.value = t;
        glint.material.opacity = 0.55 + Math.sin(t*3.4)*0.45;
        halo.material.opacity = 0.4 + Math.sin(t*0.6)*0.1;
        rimLight.intensity = 3.0 + Math.sin(t*1.7)*0.4;

        const posArr = emberGeo.attributes.position.array;
        for(let i=0;i<EMBER_COUNT;i++){
          posArr[i*3+1] += emberSpeed[i]*0.012;
          if(posArr[i*3+1] > 2.4){ posArr[i*3+1] = -1.3; posArr[i*3] = (Math.random()-0.5)*9; }
        }
        emberGeo.attributes.position.needsUpdate = true;
      }

      if(bloomOK){
        renderBloom();
      } else {
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
      }
    }catch(err){
      bloomOK = false; // degrade gracefully — keep the loop alive with a plain render
      try{ renderer.setRenderTarget(null); renderer.render(scene, camera); }catch(e2){ /* give up silently */ }
    }
  }
  frame();

  window.addEventListener('resize', ()=>{
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setSize(w,h);
    try{ buildTargets(w,h); }catch(e){ bloomOK = false; }
  });
})();

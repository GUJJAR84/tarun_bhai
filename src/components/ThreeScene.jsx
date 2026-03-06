import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ThreeScene = ({ scrollProgress, animationStarted, mousePos }) => {
  const mountRef = useRef(null);
  
  // Refs for items that need to persist across renders
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const clockRef = useRef(null);
  
  const systemsRef = useRef({
    petalSystem: null,
    dustSystem: null,
    sparkSystem: null,
    fireSystem: null,
    mandapGroup: null,
    decoLights: []
  });

  const isMobile = window.innerWidth < 768;
  const PETAL_COUNT = isMobile ? 100 : 250;
  const DUST_COUNT = isMobile ? 250 : 600;
  const FIRE_COUNT = isMobile ? 50 : 120;
  const SPARK_COUNT = isMobile ? 30 : 80;

  const C = {
    maroon: 0x6B0F1A,
    maroonDeep: 0x4A0A12,
    gold: 0xC9A84C,
    goldLight: 0xE8D48B,
    goldBright: 0xFFD700,
    goldDark: 0xA07828,
    marigold: 0xE8872A,
    warmWhite: 0xFFF8E8,
    warmBg: 0x1A0A0E,
    fire1: 0xFF4500,
    fire2: 0xFF8C00,
  };

  useEffect(() => {
    // ─── INIT ───
    if (!mountRef.current) return;
    
    clockRef.current = new THREE.Clock();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(C.warmBg);
    scene.fog = new THREE.FogExp2(C.warmBg, 0.01);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 18);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // ─── LIGHTS ───
    scene.add(new THREE.AmbientLight(C.warmWhite, 0.15));

    const main = new THREE.PointLight(C.gold, 2.5, 60);
    main.position.set(0, 12, 8);
    scene.add(main);

    const left = new THREE.PointLight(C.marigold, 1.2, 35);
    left.position.set(-10, 4, 5);
    scene.add(left);

    const right = new THREE.PointLight(C.marigold, 1.2, 35);
    right.position.set(10, 4, 5);
    scene.add(right);

    const bottom = new THREE.PointLight(C.maroon, 0.8, 25);
    bottom.position.set(0, -4, 8);
    scene.add(bottom);

    const back = new THREE.PointLight(C.goldDark, 0.6, 50);
    back.position.set(0, 5, -15);
    scene.add(back);

    scene.add(new THREE.HemisphereLight(C.goldLight, C.maroon, 0.15));

    // ─── LOAD TEXTURES & BUILD SYSTEMS ───
    const textureLoader = new THREE.TextureLoader();
    let n = 0;
    let petalTexture, particleTexture;
    
    const onTextureLoaded = () => {
      if (++n >= 2) {
        buildSystems(petalTexture, particleTexture, scene);
      }
    };
    
    petalTexture = textureLoader.load(`${import.meta.env.BASE_URL}assets/petal.png`, onTextureLoaded);
    particleTexture = textureLoader.load(`${import.meta.env.BASE_URL}assets/particle.png`, onTextureLoaded);

    // ─── RESIZE ───
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // ─── ANIMATION LOOP ───
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clockRef.current.getDelta(), 0.05);

      if (animationStarted) {
        animateParticles(dt);
        updateCamera();
      }

      renderer.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // CLEANUP
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      // Clean geoms and mats...
    };
  }, [animationStarted]); // Only run setup once or when animationStarted flips to true natively

  // Functions for Systems
  const buildSystems = (petalTex, partTex, scene) => {
    // Petals
    const pgeo = new THREE.BufferGeometry();
    const ppos = new Float32Array(PETAL_COUNT * 3);
    const pvel = new Float32Array(PETAL_COUNT * 3);
    const pphase = new Float32Array(PETAL_COUNT);
    const pcol = new Float32Array(PETAL_COUNT * 3);
    const palettes = [[1,.42,.54],[.95,.3,.35],[1,.6,.2],[.9,.15,.25],[1,.5,.4],[1,.75,.35]];

    for (let i = 0; i < PETAL_COUNT; i++) {
      ppos[i*3]=(Math.random()-.5)*40; ppos[i*3+1]=Math.random()*25+8; ppos[i*3+2]=(Math.random()-.5)*30-5;
      pvel[i*3]=(Math.random()-.5)*0.015; pvel[i*3+1]=-(Math.random()*0.015+0.008); pvel[i*3+2]=(Math.random()-.5)*0.008;
      pphase[i]=Math.random()*Math.PI*2;
      const c = palettes[Math.floor(Math.random()*palettes.length)];
      pcol[i*3]=c[0]; pcol[i*3+1]=c[1]; pcol[i*3+2]=c[2];
    }
    pgeo.setAttribute('position', new THREE.BufferAttribute(ppos,3));
    pgeo.setAttribute('color', new THREE.BufferAttribute(pcol,3));

    const petalSystem = new THREE.Points(pgeo, new THREE.PointsMaterial({
      map: petalTex, size: 0.7, transparent: true, opacity: 0.9,
      depthWrite: false, vertexColors: true, sizeAttenuation: true,
      alphaTest: 0.05
    }));
    petalSystem.userData = { vel: pvel, phase: pphase };
    scene.add(petalSystem);
    systemsRef.current.petalSystem = petalSystem;

    // Dust
    const dgeo = new THREE.BufferGeometry();
    const dpos = new Float32Array(DUST_COUNT * 3);
    const dvel = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      dpos[i*3]=(Math.random()-.5)*50; dpos[i*3+1]=(Math.random()-.5)*25; dpos[i*3+2]=(Math.random()-.5)*40;
      dvel[i*3]=(Math.random()-.5)*0.004; dvel[i*3+1]=(Math.random()-.5)*0.003; dvel[i*3+2]=(Math.random()-.5)*0.004;
    }
    dgeo.setAttribute('position', new THREE.BufferAttribute(dpos,3));

    const dustSystem = new THREE.Points(dgeo, new THREE.PointsMaterial({
      map: partTex, size: 0.18, transparent: true, opacity: 0.4,
      depthWrite: false, blending: THREE.AdditiveBlending, color: C.goldLight, sizeAttenuation: true,
    }));
    dustSystem.userData = { vel: dvel };
    scene.add(dustSystem);
    systemsRef.current.dustSystem = dustSystem;

    // Sparks
    const sgeo = new THREE.BufferGeometry();
    const spos = new Float32Array(SPARK_COUNT * 3);
    const svel = new Float32Array(SPARK_COUNT * 3);
    const slife = new Float32Array(SPARK_COUNT);
    
    const resetSpark = (p,v,l,i) => {
      const a=Math.random()*Math.PI*2, r=Math.random()*8;
      p[i*3]=Math.cos(a)*r; p[i*3+1]=(Math.random()-.3)*10; p[i*3+2]=Math.sin(a)*r-5;
      v[i*3]=(Math.random()-.5)*0.03; v[i*3+1]=Math.random()*0.02+0.01; v[i*3+2]=(Math.random()-.5)*0.03;
      l[i]=Math.random()*4+2;
    };
    
    for (let i=0; i<SPARK_COUNT; i++) resetSpark(spos,svel,slife,i);
    sgeo.setAttribute('position', new THREE.BufferAttribute(spos,3));

    const sparkSystem = new THREE.Points(sgeo, new THREE.PointsMaterial({
      map: partTex, size: 0.22, transparent: true, opacity: 0.65,
      depthWrite: false, blending: THREE.AdditiveBlending, color: C.goldBright, sizeAttenuation: true,
    }));
    sparkSystem.userData = { vel: svel, life: slife, resetSpark };
    scene.add(sparkSystem);
    systemsRef.current.sparkSystem = sparkSystem;

    // Fire
    const fgeo = new THREE.BufferGeometry();
    const fpos = new Float32Array(FIRE_COUNT*3);
    const fvel = new Float32Array(FIRE_COUNT*3);
    const fcol = new Float32Array(FIRE_COUNT*3);
    const flife = new Float32Array(FIRE_COUNT);
    
    const resetFire = (p,v,c,l,i) => {
      p[i*3]=(Math.random()-.5)*0.6; p[i*3+1]=0; p[i*3+2]=(Math.random()-.5)*0.6;
      v[i*3]=(Math.random()-.5)*0.025; v[i*3+1]=Math.random()*0.06+0.025; v[i*3+2]=(Math.random()-.5)*0.025;
      const t=Math.random();
      if(t<.25){c[i*3]=1;c[i*3+1]=.95;c[i*3+2]=.6;}
      else if(t<.5){c[i*3]=1;c[i*3+1]=.84;c[i*3+2]=0;}
      else if(t<.75){c[i*3]=1;c[i*3+1]=.55;c[i*3+2]=0;}
      else{c[i*3]=1;c[i*3+1]=.27;c[i*3+2]=0;}
      l[i]=Math.random()*2.5+.8;
    };
    
    for (let i=0; i<FIRE_COUNT; i++) resetFire(fpos,fvel,fcol,flife,i);
    fgeo.setAttribute('position', new THREE.BufferAttribute(fpos,3));
    fgeo.setAttribute('color', new THREE.BufferAttribute(fcol,3));

    const fireSystem = new THREE.Points(fgeo, new THREE.PointsMaterial({
      size: 0.35, transparent: true, opacity: 0.85, depthWrite: false,
      blending: THREE.AdditiveBlending, vertexColors: true, map: partTex, sizeAttenuation: true,
    }));
    fireSystem.userData = { vel: fvel, life: flife, resetFire };
    fireSystem.visible = false;
    scene.add(fireSystem);
    systemsRef.current.fireSystem = fireSystem;

    // Mandap
    const mandapGroup = new THREE.Group();
    mandapGroup.position.set(0, -2, -25);

    const pillarMat = new THREE.MeshStandardMaterial({ color: C.gold, metalness: .75, roughness: .25, emissive: C.gold, emissiveIntensity: .08 });
    const garlandMat = new THREE.MeshStandardMaterial({ color: C.marigold, emissive: C.marigold, emissiveIntensity: .15, roughness: .85 });
    const topMat = new THREE.MeshStandardMaterial({ color: C.goldBright, metalness: .9, roughness: .1, emissive: C.goldBright, emissiveIntensity: .2 });

    const pp = [[-3.5,3.5,-3.5],[3.5,3.5,-3.5],[-3.5,3.5,3.5],[3.5,3.5,3.5]];
    pp.forEach(pos => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,7,12), pillarMat);
      pillar.position.set(pos[0],pos[1],pos[2]);
      mandapGroup.add(pillar);

      mandapGroup.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(.3,.35,.3,12),pillarMat),{position:new THREE.Vector3(pos[0],.15,pos[2])}));
      mandapGroup.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(.2,12,12),topMat),{position:new THREE.Vector3(pos[0],7.2,pos[2])}));

      for(let g=0;g<4;g++){
        const garland=new THREE.Mesh(new THREE.TorusGeometry(.35,.06,6,12,Math.PI),garlandMat);
        garland.position.set(pos[0],1.2+g*1.5,pos[2]); garland.rotation.z=Math.PI; garland.scale.set(.9,.5,.9);
        mandapGroup.add(garland);
      }
      for(let j=0;j<7;j++){
        const ls=new THREE.Mesh(new THREE.SphereGeometry(.04,6,6),new THREE.MeshBasicMaterial({color:j%2===0?C.goldBright:C.marigold}));
        ls.position.set(pos[0]+Math.sin(j*.9)*.25,j+.5,pos[2]+Math.cos(j*.9)*.25);
        mandapGroup.add(ls);
      }
    });

    const pairs=[[pp[0],pp[1]],[pp[2],pp[3]],[pp[0],pp[2]],[pp[1],pp[3]]];
    pairs.forEach(([a,b])=>{
      for(let h=0;h<2;h++){
        const y=5.5+h*1.2;
        const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(a[0],y,a[2]),new THREE.Vector3((a[0]+b[0])/2,y-.5-h*.2,(a[2]+b[2])/2),new THREE.Vector3(b[0],y,b[2])]);
        mandapGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve,12,.06,6,false),garlandMat));
      }
    });

    const canopy=new THREE.Mesh(new THREE.PlaneGeometry(8,8,8,8),new THREE.MeshStandardMaterial({color:C.maroon,side:THREE.DoubleSide,transparent:true,opacity:.65,emissive:C.maroon,emissiveIntensity:.1}));
    canopy.position.set(0,7,0); canopy.rotation.x=-Math.PI/2;
    const cp=canopy.geometry.attributes.position;
    for(let i=0;i<cp.count;i++){const x=cp.getX(i),z=cp.getZ(i);cp.setY(i,-Math.max(0,.8-Math.min(Math.abs(Math.abs(x)-4),Math.abs(Math.abs(z)-4))*.4));}
    mandapGroup.add(canopy);

    const floor=new THREE.Mesh(new THREE.CircleGeometry(5,48),new THREE.MeshStandardMaterial({color:0x2D0808,roughness:.9}));
    floor.rotation.x=-Math.PI/2; floor.position.y=.01; mandapGroup.add(floor);

    [C.gold,C.marigold,C.goldLight,C.maroon].forEach((col,r)=>{
      const ring=new THREE.Mesh(new THREE.RingGeometry(.8+r*.7,.92+r*.7,48),new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide,transparent:true,opacity:.5}));
      ring.rotation.x=-Math.PI/2; ring.position.y=.02+r*.001; mandapGroup.add(ring);
    });

    mandapGroup.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(.5,.25,.5,16),new THREE.MeshStandardMaterial({color:0x8B4513,metalness:.5,roughness:.5})),{position:new THREE.Vector3(0,.25,0)}));

    scene.add(mandapGroup);

    const fireLight=new THREE.PointLight(C.fire2,0,20);
    fireLight.position.set(0,1,-25); scene.add(fireLight);
    mandapGroup.userData.fireLight=fireLight;
    systemsRef.current.mandapGroup = mandapGroup;

    // Deco lights
    const dlCount = isMobile ? 15 : 30;
    const decos = [];
    for(let i=0;i<dlCount;i++){
      const s=new THREE.Mesh(new THREE.SphereGeometry(.03,6,6),new THREE.MeshBasicMaterial({color:i%3===0?C.goldBright:i%3===1?C.marigold:C.gold}));
      s.position.set((Math.random()-.5)*35,Math.random()*15-2,(Math.random()-.5)*30-5);
      s.userData={baseY:s.position.y,speed:Math.random()*.5+.2,phase:Math.random()*Math.PI*2};
      scene.add(s);
      decos.push(s);
    }
    systemsRef.current.decoLights = decos;
  };

  const animateParticles = (dt) => {
    if (!clockRef.current) return;
    const t = clockRef.current.elapsedTime;
    const s = systemsRef.current;

    if (s.petalSystem) {
      const p=s.petalSystem.geometry.attributes.position.array;
      const v=s.petalSystem.userData.vel;
      const ph=s.petalSystem.userData.phase;
      for (let i=0; i<PETAL_COUNT; i++) {
        p[i*3]+=v[i*3]+Math.sin(t*.7+ph[i])*.004;
        p[i*3+1]+=v[i*3+1];
        p[i*3+2]+=v[i*3+2]+Math.cos(t*.5+ph[i])*.002;
        if (p[i*3+1]<-8) {
          p[i*3]=(Math.random()-.5)*40;
          p[i*3+1]=Math.random()*8+18;
          p[i*3+2]=(Math.random()-.5)*30-5;
        }
      }
      s.petalSystem.geometry.attributes.position.needsUpdate=true;
      s.petalSystem.rotation.y+=dt*.01;
    }

    if (s.dustSystem) {
      const p=s.dustSystem.geometry.attributes.position.array;
      const v=s.dustSystem.userData.vel;
      for (let i=0; i<DUST_COUNT; i++) {
        p[i*3]+=v[i*3]+Math.sin(t*.3+i*.07)*.001;
        p[i*3+1]+=v[i*3+1]+Math.sin(t*.4+i*.05)*.0015;
        p[i*3+2]+=v[i*3+2];
        if (Math.abs(p[i*3])>25) p[i*3]*=-.95;
        if (Math.abs(p[i*3+1])>12) p[i*3+1]*=-.95;
        if (Math.abs(p[i*3+2])>20) p[i*3+2]*=-.95;
      }
      s.dustSystem.geometry.attributes.position.needsUpdate=true;
      s.dustSystem.material.opacity = 0.35 + Math.sin(t*.5)*.1 + (scrollProgress || 0)*.15;
    }

    if (s.sparkSystem) {
      const p=s.sparkSystem.geometry.attributes.position.array;
      const v=s.sparkSystem.userData.vel;
      const l=s.sparkSystem.userData.life;
      const rs=s.sparkSystem.userData.resetSpark;
      for (let i=0; i<SPARK_COUNT; i++) {
        p[i*3]+=v[i*3]; p[i*3+1]+=v[i*3+1]; p[i*3+2]+=v[i*3+2];
        l[i]-=dt; if(l[i]<=0) rs(p,v,l,i);
      }
      s.sparkSystem.geometry.attributes.position.needsUpdate=true;
    }

    if (s.fireSystem && s.fireSystem.visible) {
      const p=s.fireSystem.geometry.attributes.position.array;
      const v=s.fireSystem.userData.vel;
      const l=s.fireSystem.userData.life;
      const c=s.fireSystem.geometry.attributes.color.array;
      const rf=s.fireSystem.userData.resetFire;
      for (let i=0; i<FIRE_COUNT; i++) {
        p[i*3]+=v[i*3]+Math.sin(t*3+i)*.003; p[i*3+1]+=v[i*3+1]; p[i*3+2]+=v[i*3+2];
        l[i]-=dt; if (l[i]<=0) { rf(p,v,c,l,i); s.fireSystem.geometry.attributes.color.needsUpdate=true; }
      }
      s.fireSystem.geometry.attributes.position.needsUpdate=true;
    }

    s.decoLights.forEach(c => {
      c.position.y = c.userData.baseY + Math.sin(t*c.userData.speed+c.userData.phase)*.5;
    });
  };

  const updateCamera = () => {
    if (!clockRef.current || !cameraRef.current) return;
    const t = scrollProgress;
    const el = clockRef.current.elapsedTime;
    const px = mousePos.x * 0.3;
    const py = mousePos.y * 0.15;
    const bx = Math.sin(el*.15)*.3;
    const by = Math.cos(el*.1)*.15;
    const camera = cameraRef.current;
    const s = systemsRef.current;

    if (t < .10) {
      camera.position.set(px+bx, 2+py+by, 18); camera.lookAt(0,1,0); 
      if (s.fireSystem) s.fireSystem.visible = false;
    } else if (t < .22) {
      const p = (t-.10)/.12;
      camera.position.set(px+bx+Math.sin(p*.8)*1.5, 2+p*.8+py+by, 18-p*3); camera.lookAt(0,1.5,0);
    } else if (t < .35) {
      const p = (t-.22)/.13;
      camera.position.set(px+bx+Math.sin(p*Math.PI)*2.5, 2.5+Math.sin(p*Math.PI*.7)*.8+py+by, 15-p*2); camera.lookAt(0,1,-2);
    } else if (t < .50) {
      const p = (t-.35)/.15;
      camera.position.set(px+bx+Math.sin(p*.5), 3+p*3+py+by, 13-p*4); camera.lookAt(0,2,-6);
    } else if (t < .58) {
      const p = (t-.50)/.08;
      camera.position.set(px+bx, 3+py+by, 9-p*2); camera.lookAt(0,1,-5);
    } else if (t < .72) {
      const p = (t-.58)/.14;
      camera.position.set(px*.5+bx*.5, 2.5+p*3+by, 7-p*28); camera.lookAt(0,1.5,-25);
      if (s.fireSystem) { s.fireSystem.visible = true; s.fireSystem.position.set(0,-1.5,-25); }
      if (s.mandapGroup?.userData.fireLight) s.mandapGroup.userData.fireLight.intensity = 1.5+Math.sin(el*5)*.8;
    } else if (t < .82) {
      const p = (t-.72)/.10;
      camera.position.set(px+bx, 4-p*2+by, -21+p*35); camera.lookAt(0,1,0); 
      if (s.fireSystem) s.fireSystem.visible = false;
    } else {
      const p = (t-.82)/.18;
      camera.position.set(px+bx, 2+by+Math.sin(p*Math.PI)*.5, 14+p*2); camera.lookAt(0,1,0);
    }
  };

  return (
    <div ref={mountRef} id="scene-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />
  );
};

export default ThreeScene;

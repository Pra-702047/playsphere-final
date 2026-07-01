"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
};

type ElectricCrack = {
  points: { x: number; y: number }[];
  alpha: number;
};

type PlayerData = {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  angle: number;
  speed: number;
  state: string; // run | shoot | celebrate | stance | swing | jump | smash | dribble | dunk | hang
  stateTimer: number;
  lastShockTime: number;
  ball?: { x: number; y: number; active: boolean; vx: number; vy: number; rotation: number };
  shuttle?: { x: number; y: number; active: boolean; vx: number; vy: number; angle: number };
};

export default function SportsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef(0);
  const shakeRef = useRef({ x: 0, y: 0, intensity: 0 });
  const shockwavesRef = useRef<{ x: number; y: number; r: number; alpha: number; maxR: number }[]>([]);
  const electricCracksRef = useRef<ElectricCrack[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Net vibration offsets for Goal Post and Basketball hoop
  const goalNetVibe = useRef(0);
  const hoopNetVibe = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setDimensions({ width, height });
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Define cybernetic players with detailed states and dedicated projectiles
    const players: PlayerData[] = [
      {
        id: "footballer",
        x: dimensions.width * 0.22,
        y: dimensions.height * 0.72,
        targetX: dimensions.width * 0.22,
        targetY: dimensions.height * 0.72,
        color: "#a3e635", // lime-400
        angle: 0,
        speed: 2.2,
        state: "run", // run -> shoot -> celebrate
        stateTimer: 0,
        lastShockTime: 0,
        ball: { x: dimensions.width * 0.23, y: dimensions.height * 0.72, active: true, vx: 0, vy: 0, rotation: 0 },
      },
      {
        id: "cricketer",
        x: dimensions.width * 0.45,
        y: dimensions.height * 0.72,
        targetX: dimensions.width * 0.45,
        targetY: dimensions.height * 0.72,
        color: "#06b6d4", // cyan-500
        angle: 0,
        speed: 1.6,
        state: "stance", // stance -> swing -> followThrough
        stateTimer: 0,
        lastShockTime: 0,
        ball: { x: dimensions.width * 0.58, y: dimensions.height * 0.62, active: true, vx: -9, vy: 2, rotation: 0 },
      },
      {
        id: "badminton",
        x: dimensions.width * 0.88,
        y: dimensions.height * 0.72,
        targetX: dimensions.width * 0.88,
        targetY: dimensions.height * 0.72,
        color: "#10b981", // emerald-500
        angle: 0,
        speed: 2.4,
        state: "stance", // stance -> jump -> smash
        stateTimer: 0,
        lastShockTime: 0,
        shuttle: { x: dimensions.width * 0.74, y: dimensions.height * 0.38, active: true, vx: 5, vy: -2, angle: 0 },
      },
      {
        id: "basketballer",
        x: dimensions.width * 0.65,
        y: dimensions.height * 0.72,
        targetX: dimensions.width * 0.65,
        targetY: dimensions.height * 0.72,
        color: "#f59e0b", // amber-500
        angle: 0,
        speed: 2.0,
        state: "dribble", // dribble -> jump -> dunk -> hang
        stateTimer: 0,
        lastShockTime: 0,
        ball: { x: dimensions.width * 0.65, y: dimensions.height * 0.65, active: true, vx: 0, vy: 0, rotation: 0 },
      },
    ];

    const createElectricArc = (x1: number, y1: number, x2: number, y2: number) => {
      const points = [{ x: x1, y: y1 }];
      const segments = 10;
      const displacement = 22;

      for (let i = 1; i < segments; i++) {
        const ratio = i / segments;
        const x = x1 + (x2 - x1) * ratio;
        const y = y1 + (y2 - y1) * ratio;

        const nx = -(y2 - y1);
        const ny = x2 - x1;
        const len = Math.hypot(nx, ny);
        const dx = (nx / len) * (Math.random() - 0.5) * displacement;
        const dy = (ny / len) * (Math.random() - 0.5) * displacement;

        points.push({ x: x + dx, y: y + dy });
      }

      points.push({ x: x2, y: y2 });
      electricCracksRef.current.push({ points, alpha: 1.0 });
    };

    const triggerShockBurst = (px: number, py: number, color: string) => {
      shakeRef.current.intensity = 26;
      shockwavesRef.current.push({
        x: px,
        y: py,
        r: 10,
        alpha: 1.2,
        maxR: 280,
      });

      createElectricArc(px, py, mouseRef.current.x, mouseRef.current.y);
      createElectricArc(px, py, mouseRef.current.x + 40, mouseRef.current.y - 45);

      const count = 55;
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 14;
        particlesRef.current.push({
          x: px,
          y: py,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          color,
          size: 2.5 + Math.random() * 4.5,
          alpha: 1.0,
          life: 0,
          maxLife: 45 + Math.random() * 35,
        });
      }
    };

    // Render loop
    const render = () => {
      time += 0.04;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

      shakeRef.current.intensity *= 0.86;
      shakeRef.current.x = (Math.random() - 0.5) * shakeRef.current.intensity;
      shakeRef.current.y = (Math.random() - 0.5) * shakeRef.current.intensity;

      // Slowly decay vibration offsets
      goalNetVibe.current *= 0.92;
      hoopNetVibe.current *= 0.92;

      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      ctx.save();
      const mouseParallaxX = (mouseRef.current.x - dimensions.width / 2) * 0.025;
      const mouseParallaxY = (mouseRef.current.y - dimensions.height / 2) * 0.025;
      ctx.translate(
        shakeRef.current.x + mouseParallaxX,
        shakeRef.current.y + mouseParallaxY - scrollRef.current * 0.15
      );

      // --- STADIUM LIGHTS ---
      const sources = [
        { x: dimensions.width * 0.08, y: 70, angle: Math.sin(time * 0.25) * 0.35 },
        { x: dimensions.width * 0.92, y: 70, angle: Math.cos(time * 0.25) * 0.35 },
      ];
      sources.forEach((light) => {
        const coneGrad = ctx.createRadialGradient(
          light.x,
          light.y,
          2,
          light.x + Math.sin(light.angle) * 850,
          light.y + 850,
          240
        );
        coneGrad.addColorStop(0, "rgba(163, 230, 53, 0.28)");
        coneGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.09)");
        coneGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(light.x - 35, light.y);
        ctx.lineTo(light.x + Math.sin(light.angle) * 1250 - 320, 1100);
        ctx.lineTo(light.x + Math.sin(light.angle) * 1250 + 320, 1100);
        ctx.lineTo(light.x + 35, light.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 45;
        ctx.shadowColor = "#a3e635";
        ctx.beginPath();
        ctx.arc(light.x, light.y, 14, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- STATIC GEAR: GOAL POST ---
      const goalX = dimensions.width * 0.05;
      const goalY = dimensions.height * 0.72;
      const goalW = 40;
      const goalH = 130;

      ctx.strokeStyle = "rgba(163, 230, 53, 0.9)";
      ctx.lineWidth = 5;
      ctx.shadowColor = "#a3e635";
      ctx.shadowBlur = 15;
      ctx.lineCap = "square";
      // Goal posts outline
      ctx.beginPath();
      ctx.moveTo(goalX, goalY);
      ctx.lineTo(goalX + goalW, goalY - goalH); // top corner
      ctx.lineTo(goalX, goalY - goalH);
      ctx.lineTo(goalX, goalY);
      ctx.stroke();

      // Net Mesh back curves (affected by goalNetVibe)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;
      for (let i = 0; i <= goalH; i += 15) {
        ctx.beginPath();
        ctx.moveTo(goalX, goalY - i);
        // Net sags back with dynamic sine wave vibration
        const sagX = goalX + goalW * (i / goalH) + Math.sin(time * 12) * goalNetVibe.current * (1 - i / goalH);
        ctx.lineTo(sagX, goalY - i * 0.85);
        ctx.stroke();
      }

      // --- STATIC GEAR: BASKETBALL HOOP & BACKBOARD ---
      const boardX = dimensions.width * 0.75;
      const boardY = dimensions.height * 0.32;
      const hoopX = boardX - 25;
      const hoopY = boardY + 30;

      // Backboard
      ctx.strokeStyle = "rgba(245, 158, 11, 0.8)"; // Orange
      ctx.lineWidth = 4;
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 10;
      ctx.strokeRect(boardX - 40, boardY - 40, 80, 60);
      ctx.strokeRect(boardX - 15, boardY - 10, 30, 20);

      // Hoop Rim
      ctx.strokeStyle = "rgba(239, 68, 68, 0.95)"; // Orange-red
      ctx.lineWidth = 4;
      ctx.shadowColor = "#ef4444";
      ctx.beginPath();
      ctx.ellipse(hoopX, hoopY, 15, 4, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Net dangling strings (vibrating)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(hoopX - 14, hoopY);
      ctx.quadraticCurveTo(hoopX - 8 + Math.sin(time * 15) * hoopNetVibe.current, hoopY + 25, hoopX - 5, hoopY + 28);
      ctx.moveTo(hoopX + 14, hoopY);
      ctx.quadraticCurveTo(hoopX + 8 + Math.sin(time * 15 + 2) * hoopNetVibe.current, hoopY + 25, hoopX + 5, hoopY + 28);
      ctx.stroke();


      // --- RENDER SPORTS CHARACTERS ---
      players.forEach((p) => {
        p.stateTimer++;
        const cycle = time * p.speed;

        // --- CYBERNETIC JOINT POSITIONS & STATE MACHINES ---
        let hipX = p.x;
        let hipY = p.y - 25;
        let headX = p.x;
        let headY = p.y - 85;

        let lKneeX = hipX - 18, lKneeY = hipY + 28, lFootX = lKneeX - 10, lFootY = lKneeY + 22;
        let rKneeX = hipX + 18, rKneeY = hipY + 28, rFootX = rKneeX + 10, rFootY = rKneeY + 22;

        let lShoulderX = p.x - 22, lShoulderY = p.y - 68;
        let rShoulderX = p.x + 22, rShoulderY = p.y - 68;

        let lElbowX = lShoulderX - 15, lElbowY = lShoulderY + 20, lHandX = lElbowX - 10, lHandY = lElbowY + 12;
        let rElbowX = rShoulderX + 15, rElbowY = rShoulderY + 20, rHandX = rElbowX + 10, rHandY = rElbowY + 12;

        let gearAngle = 0; // racket/bat rotation angle

        if (p.id === "footballer") {
          // FOOTBALL STATE MACHINE: Run -> Shoot -> Slide -> Celebrate
          if (p.state === "run") {
            p.x -= 2.0; // Runs left towards Goal
            if (p.x < dimensions.width * 0.16) {
              p.state = "shoot";
              p.stateTimer = 0;
            }

            // Running joint cycles
            hipY = p.y - 25 + Math.sin(cycle * 2) * 5;
            headY = hipY - 60;

            lKneeX = hipX + Math.sin(cycle) * 20;
            lKneeY = hipY + 25 + Math.cos(cycle) * 8;
            lFootX = lKneeX + Math.sin(cycle + 0.3) * 15;
            lFootY = lKneeY + 20;

            rKneeX = hipX + Math.sin(cycle + Math.PI) * 20;
            rKneeY = hipY + 25 + Math.cos(cycle + Math.PI) * 8;
            rFootX = rKneeX + Math.sin(cycle + Math.PI + 0.3) * 15;
            rFootY = rKneeY + 20;

            // Arms pumping out of phase
            lElbowX = lShoulderX - 15 + Math.cos(cycle) * 10;
            lElbowY = lShoulderY + 15 + Math.sin(cycle) * 10;
            lHandX = lElbowX - 10; lHandY = lElbowY + 10;

            rElbowX = rShoulderX + 15 + Math.cos(cycle + Math.PI) * 10;
            rElbowY = rShoulderY + 15 + Math.sin(cycle + Math.PI) * 10;
            rHandX = rElbowX + 10; rHandY = rElbowY + 10;

            // Ball dribbles ahead of player
            if (p.ball) {
              p.ball.x = p.x - 30;
              p.ball.y = p.y + 12;
            }

          } else if (p.state === "shoot") {
            // Kick animation
            const progress = p.stateTimer / 15; // 15 frames duration
            
            // Swing right leg forward to strike
            rKneeX = hipX - 25 + progress * 35;
            rKneeY = hipY + 30 - Math.sin(progress * Math.PI) * 12;
            rFootX = rKneeX - 10 + progress * 40;
            rFootY = rKneeY + 18 - Math.sin(progress * Math.PI) * 22;

            if (p.stateTimer === 6 && p.ball) {
              // Ball struck! High velocity towards Goal net
              p.ball.vx = -16;
              p.ball.vy = -7;
              
              // Spark impact burst
              for (let i = 0; i < 15; i++) {
                particlesRef.current.push({
                  x: p.ball.x,
                  y: p.ball.y,
                  vx: -8 - Math.random() * 8,
                  vy: -4 + (Math.random() - 0.5) * 8,
                  color: p.color,
                  size: 2 + Math.random() * 3,
                  alpha: 1.0,
                  life: 0,
                  maxLife: 20 + Math.random() * 20,
                });
              }
            }

            if (p.stateTimer > 18) {
              p.state = "celebrate";
              p.stateTimer = 0;
            }
          } else if (p.state === "celebrate") {
            // Knee slide or arms raised
            p.x += 0.8;
            hipY = p.y - 12; // slide lower
            lKneeX = hipX - 15; lKneeY = p.y + 10;
            lFootX = lKneeX - 15; lFootY = p.y + 18;
            rKneeX = hipX - 10; rKneeY = p.y + 10;
            rFootX = rKneeX - 15; rFootY = p.y + 18;

            // Arms raised high
            lHandY = headY - 20; lHandX = headX - 25;
            rHandY = headY - 20; rHandX = headX + 25;

            // Ball flying physics
            if (p.ball && p.ball.active) {
              p.ball.x += p.ball.vx;
              p.ball.y += p.ball.vy;
              p.ball.vy += 0.25; // gravity

              // Goal Net impact check
              if (p.ball.x <= goalX + goalW && p.ball.x >= goalX && p.ball.y > goalY - goalH && p.ball.y < goalY) {
                goalNetVibe.current = 14; // trigger net vibration!
                p.ball.vx = 1.2; // rebound slowly
                p.ball.vy = 2.0;
              }

              // Roll on floor
              if (p.ball.y > p.y + 10) {
                p.ball.y = p.y + 10;
                p.ball.vy = -p.ball.vy * 0.4;
                p.ball.vx *= 0.88;
              }
            }

            if (p.stateTimer > 110) {
              p.state = "run";
              p.stateTimer = 0;
              p.x = dimensions.width * 0.32;
              if (p.ball) {
                p.ball.active = true;
                p.ball.vx = 0; p.ball.vy = 0;
              }
            }
          }

        } else if (p.id === "cricketer") {
          // CRICKETER: Stance -> Swing bat -> Follow Through
          if (p.state === "stance") {
            // Idle breathing
            hipY = p.y - 25 + Math.sin(time * 3) * 1.5;
            headY = hipY - 60;
            
            // Hold bat backlift angle
            gearAngle = -1.2; 
            lHandX = p.x - 14; lHandY = p.y - 48;
            rHandX = p.x - 10; rHandY = p.y - 46;

            // Ball flying in from right side
            if (p.ball && p.ball.active) {
              p.ball.x += p.ball.vx;
              p.ball.y += p.ball.vy;
              
              // Hitting zone trigger
              if (p.ball.x <= p.x + 35 && p.ball.x >= p.x - 20) {
                p.state = "swing";
                p.stateTimer = 0;
              }
            }

          } else if (p.state === "swing") {
            // Swing bat arc
            const progress = p.stateTimer / 12;
            gearAngle = -1.2 + progress * 2.8; // full forward swing
            
            lHandX = p.x + Math.sin(progress) * 20;
            lHandY = p.y - 40 - Math.cos(progress) * 10;
            rHandX = lHandX + 4; rHandY = lHandY + 2;

            // Ball impact check
            if (p.stateTimer === 4 && p.ball) {
              p.ball.vx = 14 + Math.random() * 8; // hit far right
              p.ball.vy = -9 - Math.random() * 6; // high sky shot
              
              // Spark blast
              for (let i = 0; i < 18; i++) {
                particlesRef.current.push({
                  x: p.ball.x,
                  y: p.ball.y,
                  vx: 6 + Math.random() * 10,
                  vy: -4 - Math.random() * 8,
                  color: p.color,
                  size: 2 + Math.random() * 4,
                  alpha: 1.0,
                  life: 0,
                  maxLife: 25 + Math.random() * 20,
                });
              }
            }

            if (p.stateTimer > 12) {
              p.state = "followThrough";
              p.stateTimer = 0;
            }

          } else if (p.state === "followThrough") {
            // Hold finishing pose
            gearAngle = 1.6;
            
            if (p.ball && p.ball.active) {
              p.ball.x += p.ball.vx;
              p.ball.y += p.ball.vy;
              p.ball.vy += 0.22; // gravity

              // Bounce off boundaries
              if (p.ball.y > p.y + 12) {
                p.ball.y = p.y + 12;
                p.ball.vy = -p.ball.vy * 0.6;
                p.ball.vx *= 0.95;
              }
            }

            if (p.stateTimer > 70) {
              p.state = "stance";
              p.stateTimer = 0;
              if (p.ball) {
                p.ball.x = dimensions.width * 0.58;
                p.ball.y = dimensions.height * 0.62;
                p.ball.vx = -9; p.ball.vy = 2.0;
              }
            }
          }

        } else if (p.id === "badminton") {
          // BADMINTON: Stance -> Jump -> Smash smash racket
          if (p.state === "stance") {
            hipY = p.y - 25;
            headY = hipY - 60;
            gearAngle = -0.5; // hold racket ready

            // Shuttle arrives in smash zone
            if (p.shuttle && p.shuttle.active) {
              p.shuttle.x += p.shuttle.vx;
              p.shuttle.y += p.shuttle.vy;
              
              if (p.shuttle.x >= p.x - 60 && p.shuttle.x <= p.x) {
                p.state = "jump";
                p.stateTimer = 0;
              }
            }

          } else if (p.state === "jump") {
            // Elevate body in jump
            const progress = p.stateTimer / 15;
            p.y = p.targetY - Math.sin(progress * Math.PI) * 75;
            
            hipY = p.y - 25;
            headY = hipY - 60;
            
            // Cock racket back
            gearAngle = -1.5;
            lHandY = headY - 10; lHandX = headX - 20;

            if (p.stateTimer === 7) {
              p.state = "smash";
              p.stateTimer = 0;
            }

          } else if (p.state === "smash") {
            // Rapid swing smash down
            const progress = p.stateTimer / 10;
            gearAngle = -1.5 + progress * 2.8;

            if (p.stateTimer === 2 && p.shuttle) {
              // Shuttle smashed diagonally down left
              p.shuttle.vx = -19;
              p.shuttle.vy = 10;
              
              // Spark impact burst
              for (let i = 0; i < 12; i++) {
                particlesRef.current.push({
                  x: p.shuttle.x,
                  y: p.shuttle.y,
                  vx: -12 - Math.random() * 8,
                  vy: 4 + Math.random() * 8,
                  color: p.color,
                  size: 2 + Math.random() * 3,
                  alpha: 1.0,
                  life: 0,
                  maxLife: 20 + Math.random() * 15,
                });
              }
            }

            if (p.stateTimer > 10) {
              p.state = "followThrough";
              p.stateTimer = 0;
            }

          } else if (p.state === "followThrough") {
            // Fall back to floor ground
            p.y += (p.targetY - p.y) * 0.15;
            hipY = p.y - 25;
            headY = hipY - 60;
            
            if (p.shuttle && p.shuttle.active) {
              p.shuttle.x += p.shuttle.vx;
              p.shuttle.y += p.shuttle.vy;
              
              // Rebound off floor boundary
              if (p.shuttle.y > p.y + 12) {
                p.shuttle.y = p.y + 12;
                p.shuttle.vx *= 0.2;
                p.shuttle.vy = 0;
              }
            }

            if (p.stateTimer > 60) {
              p.state = "stance";
              p.stateTimer = 0;
              p.y = p.targetY;
              if (p.shuttle) {
                p.shuttle.x = dimensions.width * 0.72;
                p.shuttle.y = dimensions.height * 0.38;
                p.shuttle.vx = 5; p.shuttle.vy = -2.0;
              }
            }
          }

        } else if (p.id === "basketballer") {
          // BASKETBALL: Dribble run -> Elevate lunge -> Dunk hoop -> Hang rim -> Drop
          if (p.state === "dribble") {
            p.x += 1.8; // Approaches net on right
            
            if (p.x > boardX - 80) {
              p.state = "jump";
              p.stateTimer = 0;
            }

            // Running joint cycles
            hipY = p.y - 25 + Math.sin(cycle * 2) * 4;
            headY = hipY - 60;

            lKneeX = hipX + Math.sin(cycle) * 18;
            lKneeY = hipY + 25 + Math.cos(cycle) * 8;
            lFootX = lKneeX + 10; lFootY = lKneeY + 20;

            rKneeX = hipX + Math.sin(cycle + Math.PI) * 18;
            rKneeY = hipY + 25 + Math.cos(cycle + Math.PI) * 8;
            rFootX = rKneeX + 10; rFootY = rKneeY + 20;

            // Dribbles ball up and down
            if (p.ball) {
              p.ball.x = p.x + 25;
              p.ball.y = p.y - 10 + Math.abs(Math.sin(time * 4)) * 30;
            }

          } else if (p.state === "jump") {
            // Elevate high
            const progress = p.stateTimer / 18;
            p.y = p.targetY - Math.sin(progress * Math.PI) * 110;
            p.x += 0.8;

            hipY = p.y - 25;
            headY = hipY - 60;

            // Legs tucked
            lKneeX = hipX - 10; lKneeY = hipY + 15;
            rKneeX = hipX + 10; rKneeY = hipY + 15;

            // Ball in hand raised above head
            if (p.ball) {
              p.ball.x = p.x + 18;
              p.ball.y = headY - 10;
            }

            if (p.x >= hoopX - 15) {
              p.state = "dunk";
              p.stateTimer = 0;
            }

          } else if (p.state === "dunk") {
            // Dunk strike!
            hoopNetVibe.current = 15; // Net shake
            shakeRef.current.intensity = 15;

            if (p.ball) {
              p.ball.vx = 2;
              p.ball.vy = 12; // shoot straight down
            }

            // Spark burst
            for (let i = 0; i < 20; i++) {
              particlesRef.current.push({
                x: hoopX,
                y: hoopY,
                vx: (Math.random() - 0.5) * 8,
                vy: 5 + Math.random() * 8,
                color: p.color,
                size: 2.5 + Math.random() * 3,
                alpha: 1.0,
                life: 0,
                maxLife: 25 + Math.random() * 20,
              });
            }

            p.state = "hang";
            p.stateTimer = 0;

          } else if (p.state === "hang") {
            // Hold rim for split second
            p.y = hoopY + 28;
            hipY = p.y - 25;
            headY = hipY - 60;

            // Hand grips hoop
            rHandX = hoopX; rHandY = hoopY;

            // Ball bounces down below hoop
            if (p.ball) {
              p.ball.x += p.ball.vx;
              p.ball.y += p.ball.vy;
              
              if (p.ball.y > p.y + 20) {
                p.ball.y = p.y + 20;
                p.ball.vy = -p.ball.vy * 0.55;
                p.ball.vx *= 0.9;
              }
            }

            if (p.stateTimer > 25) {
              p.state = "drop";
              p.stateTimer = 0;
            }

          } else if (p.state === "drop") {
            // Drop back to floor ground
            p.y += (p.targetY - p.y) * 0.12;
            hipY = p.y - 25;
            headY = hipY - 60;

            if (p.ball) {
              p.ball.x += p.ball.vx;
              p.ball.y += p.ball.vy;
              p.ball.vy += 0.25;

              if (p.ball.y > p.y + 12) {
                p.ball.y = p.y + 12;
                p.ball.vy = -p.ball.vy * 0.55;
              }
            }

            if (p.stateTimer > 35) {
              p.state = "dribble";
              p.stateTimer = 0;
              p.x = dimensions.width * 0.55;
              p.y = p.targetY;
            }
          }
        }

        // Proximity checks for mouse energy shock
        const dist = Math.hypot(mouseRef.current.x - p.x, mouseRef.current.y - p.y);
        const now = Date.now();
        if (dist < 90 && now - p.lastShockTime > 1800) {
          p.lastShockTime = now;
          triggerShockBurst(p.x, p.y, p.color);
        }

        // --- CYBERNETIC CHROMATIC ABERRATION BLENDING ---
        const isShockRecent = now - p.lastShockTime < 450;
        const splitOffset = isShockRecent ? Math.max(0, 11 - (now - p.lastShockTime) * 0.032) : 0;

        const renderBones = (dx: number, dy: number, strokeColor: string) => {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 4;
          ctx.lineCap = "round";

          const drawBone = (x1: number, y1: number, x2: number, y2: number) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          };

          // Head glowing node
          ctx.beginPath();
          ctx.arc(headX + dx, headY + dy, 12, 0, Math.PI * 2);
          ctx.stroke();

          // Body skeleton wireframe
          drawBone(headX + dx, headY + 12 + dy, hipX + dx, hipY - 25 + dy); // Spine
          drawBone(lShoulderX + dx, lShoulderY + dy, rShoulderX + dx, rShoulderY + dy); // Shoulders

          // Left Arm
          drawBone(lShoulderX + dx, lShoulderY + dy, lElbowX + dx, lElbowY + dy);
          drawBone(lElbowX + dx, lElbowY + dy, lHandX + dx, lHandY + dy);

          // Right Arm
          drawBone(rShoulderX + dx, rShoulderY + dy, rElbowX + dx, rElbowY + dy);
          drawBone(rElbowX + dx, rElbowY + dy, rHandX + dx, rHandY + dy);

          // Left Leg
          drawBone(hipX - 10 + dx, hipY - 25 + dy, lKneeX + dx, lKneeY + dy);
          drawBone(lKneeX + dx, lKneeY + dy, lFootX + dx, lFootY + dy);

          // Right Leg
          drawBone(hipX + 10 + dx, hipY - 25 + dy, rKneeX + dx, rKneeY + dy);
          drawBone(rKneeX + dx, rKneeY + dy, rFootX + dx, rFootY + dy);

          // --- GEAR OVERLAYS ---
          ctx.lineWidth = 3;
          if (p.id === "cricketer") {
            // Draw cricket bat from hands extending out
            const batLen = 42;
            const batEndX = rHandX + Math.cos(gearAngle) * batLen + dx;
            const batEndY = rHandY + Math.sin(gearAngle) * batLen + dy;
            
            ctx.beginPath();
            ctx.moveTo(rHandX + dx, rHandY + dy);
            ctx.lineTo(batEndX, batEndY);
            ctx.stroke();
            
            // Bat thickness outline
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(rHandX + Math.cos(gearAngle) * 15 + dx, rHandY + Math.sin(gearAngle) * 15 + dy);
            ctx.lineTo(batEndX, batEndY);
            ctx.stroke();
          } else if (p.id === "badminton") {
            // Draw racket handle and net head
            const shaftLen = 30;
            const shaftEndX = rHandX + Math.cos(gearAngle) * shaftLen + dx;
            const shaftEndY = rHandY + Math.sin(gearAngle) * shaftLen + dy;
            
            // Shaft
            ctx.beginPath();
            ctx.moveTo(rHandX + dx, rHandY + dy);
            ctx.lineTo(shaftEndX, shaftEndY);
            ctx.stroke();

            // Oval net head
            ctx.beginPath();
            ctx.ellipse(shaftEndX + Math.cos(gearAngle) * 10, shaftEndY + Math.sin(gearAngle) * 10, 10, 7, gearAngle, 0, Math.PI * 2);
            ctx.stroke();
          }
        };

        if (splitOffset > 0) {
          ctx.globalCompositeOperation = "screen";
          renderBones(-splitOffset, 0, "rgba(239, 68, 68, 0.85)"); // Red Aberration
          renderBones(splitOffset, 0, "rgba(6, 182, 212, 0.85)");  // Cyan Aberration
          ctx.globalCompositeOperation = "source-over";
        } else {
          renderBones(0, 0, p.color);
        }

        // --- DRAW PROJECTILES WITH MOTION BLUR TRAILS ---
        if (p.ball && p.ball.active) {
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(p.ball.x, p.ball.y, 8, 0, Math.PI * 2);
          ctx.fill();

          // Motion trailing vector
          if (Math.hypot(p.ball.vx, p.ball.vy) > 1.0) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.moveTo(p.ball.x, p.ball.y);
            ctx.lineTo(p.ball.x - p.ball.vx * 3.5, p.ball.y - p.ball.vy * 3.5);
            ctx.stroke();
          }
        }

        if (p.shuttle && p.shuttle.active) {
          // Draw cone-shaped shuttlecock
          ctx.strokeStyle = "#ffffff";
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 15;
          ctx.lineWidth = 2.5;

          const sx = p.shuttle.x;
          const sy = p.shuttle.y;
          const svx = p.shuttle.vx;
          const svy = p.shuttle.vy;
          const sAngle = Math.atan2(svy, svx);

          ctx.beginPath();
          // Cork head
          ctx.arc(sx, sy, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();

          // Feathers skirt
          ctx.moveTo(sx - Math.cos(sAngle) * 4, sy - Math.sin(sAngle) * 4);
          ctx.lineTo(sx - Math.cos(sAngle - 0.45) * 15, sy - Math.sin(sAngle - 0.45) * 15);
          ctx.lineTo(sx - Math.cos(sAngle + 0.45) * 15, sy - Math.sin(sAngle + 0.45) * 15);
          ctx.closePath();
          ctx.stroke();

          // Trail
          if (Math.hypot(svx, svy) > 2.0) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - svx * 2.8, sy - svy * 2.8);
            ctx.stroke();
          }
        }
      });

      // --- EXPAND SHOCKWAVES ---
      shockwavesRef.current.forEach((sw) => {
        sw.r += (sw.maxR - sw.r) * 0.082;
        sw.alpha -= 0.032;

        ctx.strokeStyle = `rgba(163, 230, 53, ${sw.alpha})`;
        ctx.shadowColor = "#a3e635";
        ctx.shadowBlur = 25;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(6, 182, 212, ${sw.alpha * 0.5})`;
        ctx.shadowColor = "#06b6d4";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r * 0.76, 0, Math.PI * 2);
        ctx.stroke();
      });
      shockwavesRef.current = shockwavesRef.current.filter((sw) => sw.alpha > 0);

      // --- ELECTRIC CRACKS ---
      electricCracksRef.current.forEach((crack) => {
        crack.alpha -= 0.095;
        ctx.strokeStyle = `rgba(255, 255, 255, ${crack.alpha})`;
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 30;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(crack.points[0].x, crack.points[0].y);
        for (let i = 1; i < crack.points.length; i++) {
          ctx.lineTo(crack.points[i].x, crack.points[i].y);
        }
        ctx.stroke();
      });
      electricCracksRef.current = electricCracksRef.current.filter((c) => c.alpha > 0);

      // --- AMBIENT sparks ---
      if (Math.random() < 0.42) {
        particlesRef.current.push({
          x: Math.random() * dimensions.width,
          y: dimensions.height + 20,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -0.9 - Math.random() * 2.2,
          color: Math.random() < 0.5 ? "#84cc16" : "#06b6d4",
          size: 1.5 + Math.random() * 2.8,
          alpha: 0.2 + Math.random() * 0.45,
          life: 0,
          maxLife: 160 + Math.random() * 110,
        });
      }

      if (Math.hypot(mouseRef.current.targetX - mouseRef.current.x, mouseRef.current.targetY - mouseRef.current.y) > 5) {
        particlesRef.current.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          color: "#a3e635",
          size: 2 + Math.random() * 2,
          alpha: 0.82,
          life: 0,
          maxLife: 25 + Math.random() * 18,
        });
      }

      particlesRef.current.forEach((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;

        const ratio = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - ratio);

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

      ctx.restore();

      // Soft fog drift overlay
      const fogGrad = ctx.createLinearGradient(0, dimensions.height * 0.5, 0, dimensions.height);
      fogGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      fogGrad.addColorStop(0.7, `rgba(6, 6, 6, ${0.46 + Math.sin(time * 0.1) * 0.045})`);
      fogGrad.addColorStop(1, "rgba(0, 0, 0, 1)");
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, dimensions.height * 0.4, dimensions.width, dimensions.height * 0.6);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

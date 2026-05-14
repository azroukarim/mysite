'use client';

import React, { useEffect } from 'react';

const ParticlesBackground: React.FC<{ className?: string }> = ({ className }) => {
  useEffect(() => {
    // Check if we are in the browser
    if (typeof window === 'undefined') return;

    /* particles.js library implementation */
    const initParticles = () => {
      const pJS = function(this: any, tag_id: string, params: any) {
        const pJS_tag = document.getElementById(tag_id);
        if (!pJS_tag) return;
        
        const canvas_el = pJS_tag.getElementsByClassName('particles-js-canvas-el')[0] as HTMLCanvasElement;
        
        this.pJS = {
          canvas: { el: canvas_el, w: canvas_el.offsetWidth, h: canvas_el.offsetHeight },
          particles: {
            number: { value: 400, density: { enable: true, value_area: 800 } },
            color: { value: '#fff' },
            shape: { type: 'circle', stroke: { width: 0, color: '#ff0000' }, polygon: { nb_sides: 5 }, image: { src: '', width: 100, height: 100 } },
            opacity: { value: 1, random: false, anim: { enable: false, speed: 2, opacity_min: 0.1, sync: false } },
            size: { value: 20, random: false, anim: { enable: false, speed: 20, size_min: 0.1, sync: false } },
            line_linked: { enable: true, distance: 100, color: '#fff', opacity: 1, width: 1 },
            move: { enable: true, speed: 2, direction: 'none' as any, random: false, straight: false, out_mode: 'out', bounce: false, attract: { enable: false, rotateX: 3000, rotateY: 3000 } },
            array: [] as any[]
          },
          interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
            modes: { grab: { distance: 100, line_linked: { opacity: 1 } }, bubble: { distance: 200, size: 80, duration: 0.4 }, repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } },
            mouse: {} as any
          },
          retina_detect: false,
          fn: { interact: {} as any, modes: {} as any, vendors: {} as any },
          tmp: { isMouseDown: false } as any
        };

        const pJS_obj = this.pJS;
        if (params) { 
          const deepExtend = (destination: any, source: any) => {
            for (const property in source) {
              if (source[property] && source[property].constructor && source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                deepExtend(destination[property], source[property]);
              } else {
                destination[property] = source[property];
              }
            }
            return destination;
          };
          deepExtend(pJS_obj, params); 
        }

        pJS_obj.tmp.obj = {
          size_value: pJS_obj.particles.size.value, size_anim_speed: pJS_obj.particles.size.anim.speed,
          move_speed: pJS_obj.particles.move.speed, line_linked_distance: pJS_obj.particles.line_linked.distance,
          line_linked_width: pJS_obj.particles.line_linked.width, mode_grab_distance: pJS_obj.interactivity.modes.grab.distance,
          mode_bubble_distance: pJS_obj.interactivity.modes.bubble.distance, mode_bubble_size: pJS_obj.interactivity.modes.bubble.size,
          mode_repulse_distance: pJS_obj.interactivity.modes.repulse.distance
        };

        pJS_obj.fn.retinaInit = function() {
          if (pJS_obj.retina_detect && window.devicePixelRatio > 1) { pJS_obj.canvas.pxratio = window.devicePixelRatio; pJS_obj.tmp.retina = true; } else { pJS_obj.canvas.pxratio = 1; pJS_obj.tmp.retina = false; }
          pJS_obj.canvas.w = pJS_obj.canvas.el.offsetWidth * pJS_obj.canvas.pxratio;
          pJS_obj.canvas.h = pJS_obj.canvas.el.offsetHeight * pJS_obj.canvas.pxratio;
          pJS_obj.particles.size.value = pJS_obj.tmp.obj.size_value * pJS_obj.canvas.pxratio;
          pJS_obj.particles.size.anim.speed = pJS_obj.tmp.obj.size_anim_speed * pJS_obj.canvas.pxratio;
          pJS_obj.particles.move.speed = pJS_obj.tmp.obj.move_speed * pJS_obj.canvas.pxratio;
          pJS_obj.particles.line_linked.distance = pJS_obj.tmp.obj.line_linked_distance * pJS_obj.canvas.pxratio;
          pJS_obj.interactivity.modes.grab.distance = pJS_obj.tmp.obj.mode_grab_distance * pJS_obj.canvas.pxratio;
          pJS_obj.interactivity.modes.bubble.distance = pJS_obj.tmp.obj.mode_bubble_distance * pJS_obj.canvas.pxratio;
          pJS_obj.particles.line_linked.width = pJS_obj.tmp.obj.line_linked_width * pJS_obj.canvas.pxratio;
          pJS_obj.interactivity.modes.bubble.size = pJS_obj.tmp.obj.mode_bubble_size * pJS_obj.canvas.pxratio;
          pJS_obj.interactivity.modes.repulse.distance = pJS_obj.tmp.obj.mode_repulse_distance * pJS_obj.canvas.pxratio;
        };

        pJS_obj.fn.canvasInit = function() { pJS_obj.canvas.ctx = pJS_obj.canvas.el.getContext('2d'); };
        pJS_obj.fn.canvasSize = function() {
          pJS_obj.canvas.el.width = pJS_obj.canvas.w;
          pJS_obj.canvas.el.height = pJS_obj.canvas.h;
          if (pJS_obj && pJS_obj.interactivity.events.resize) {
            window.addEventListener('resize', function() {
              pJS_obj.canvas.w = pJS_obj.canvas.el.offsetWidth;
              pJS_obj.canvas.h = pJS_obj.canvas.el.offsetHeight;
              if (pJS_obj.tmp.retina) { pJS_obj.canvas.w *= pJS_obj.canvas.pxratio;
                pJS_obj.canvas.h *= pJS_obj.canvas.pxratio; }
              pJS_obj.canvas.el.width = pJS_obj.canvas.w;
              pJS_obj.canvas.el.height = pJS_obj.canvas.h;
              if (!pJS_obj.particles.move.enable) { pJS_obj.fn.particlesEmpty();
                pJS_obj.fn.particlesCreate();
                pJS_obj.fn.particlesDraw();
                pJS_obj.fn.vendors.densityAutoParticles(); }
              pJS_obj.fn.vendors.densityAutoParticles();
            });
          }
        };

        pJS_obj.fn.canvasPaint = function() { pJS_obj.canvas.ctx.fillRect(0, 0, pJS_obj.canvas.w, pJS_obj.canvas.h); };
        pJS_obj.fn.canvasClear = function() { pJS_obj.canvas.ctx.clearRect(0, 0, pJS_obj.canvas.w, pJS_obj.canvas.h); };

        pJS_obj.fn.particle = function(this: any, color: any, opacity: any, position: any) {
          this.radius = (pJS_obj.particles.size.random ? Math.random() : 1) * pJS_obj.particles.size.value;
          if (pJS_obj.particles.size.anim.enable) { this.size_status = false;
            this.vs = pJS_obj.particles.size.anim.speed / 100; if (!pJS_obj.particles.size.anim.sync) { this.vs = this.vs * Math.random(); } }
          this.x = position ? position.x : Math.random() * pJS_obj.canvas.w;
          this.y = position ? position.y : Math.random() * pJS_obj.canvas.h;
          if (this.x > pJS_obj.canvas.w - this.radius * 2) this.x = this.x - this.radius;
          else if (this.x < this.radius * 2) this.x = this.x + this.radius;
          if (this.y > pJS_obj.canvas.h - this.radius * 2) this.y = this.y - this.radius;
          else if (this.y < this.radius * 2) this.y = this.y + this.radius;
          if (pJS_obj.particles.move.bounce) { pJS_obj.fn.vendors.checkOverlap(this, position); }
          this.color = {};
          
          const hexToRgb = (hex: string) => {
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) { return r + r + g + g + b + b; });
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
          };

          if (typeof(color.value) == 'object') {
            if (color.value instanceof Array) { const color_selected = color.value[Math.floor(Math.random() * pJS_obj.particles.color.value.length)];
              this.color.rgb = hexToRgb(color_selected); } else {
              if (color.value.r != undefined && color.value.g != undefined && color.value.b != undefined) { this.color.rgb = { r: color.value.r, g: color.value.g, b: color.value.b }; }
              if (color.value.h != undefined && color.value.s != undefined && color.value.l != undefined) { this.color.hsl = { h: color.value.h, s: color.value.s, l: color.value.l }; }
            }
          } else if (color.value == 'random') { this.color.rgb = { r: (Math.floor(Math.random() * (255 - 0 + 1)) + 0), g: (Math.floor(Math.random() * (255 - 0 + 1)) + 0), b: (Math.floor(Math.random() * (255 - 0 + 1)) + 0) }; } else if (typeof(color.value) == 'string') { this.color = color;
            this.color.rgb = hexToRgb(this.color.value); }
          this.opacity = (pJS_obj.particles.opacity.random ? Math.random() : 1) * pJS_obj.particles.opacity.value;
          if (pJS_obj.particles.opacity.anim.enable) { this.opacity_status = false;
            this.vo = pJS_obj.particles.opacity.anim.speed / 100; if (!pJS_obj.particles.opacity.anim.sync) { this.vo = this.vo * Math.random(); } }
          
          let velbase = { x: 0, y: 0 };
          switch (pJS_obj.particles.move.direction) {
            case 'top': velbase = { x: 0, y: -1 }; break;
            case 'top-right': velbase = { x: 0.5, y: -0.5 }; break;
            case 'right': velbase = { x: 1, y: -0 }; break;
            case 'bottom-right': velbase = { x: 0.5, y: 0.5 }; break;
            case 'bottom': velbase = { x: 0, y: 1 }; break;
            case 'bottom-left': velbase = { x: -0.5, y: 1 }; break;
            case 'left': velbase = { x: -1, y: 0 }; break;
            case 'top-left': velbase = { x: -0.5, y: -0.5 }; break;
            default: velbase = { x: 0, y: 0 }; break;
          }
          if (pJS_obj.particles.move.straight) { this.vx = velbase.x;
            this.vy = velbase.y; if (pJS_obj.particles.move.random) { this.vx = this.vx * (Math.random());
              this.vy = this.vy * (Math.random()); } } else { this.vx = velbase.x + Math.random() - 0.5;
            this.vy = velbase.y + Math.random() - 0.5; }
          this.vx_i = this.vx;
          this.vy_i = this.vy;
          const shape_type = pJS_obj.particles.shape.type;
          if (typeof(shape_type) == 'object') { if (shape_type instanceof Array) { const shape_selected = shape_type[Math.floor(Math.random() * shape_type.length)];
              this.shape = shape_selected; } } else { this.shape = shape_type; }
        };

        pJS_obj.fn.particle.prototype.draw = function() {
          const p = this;
          const radius = p.radius_bubble != undefined ? p.radius_bubble : p.radius;
          const opacity = p.opacity_bubble != undefined ? p.opacity_bubble : p.opacity;
          const color_value = p.color.rgb ? 'rgba(' + p.color.rgb.r + ',' + p.color.rgb.g + ',' + p.color.rgb.b + ',' + opacity + ')' : 'hsla(' + p.color.hsl.h + ',' + p.color.hsl.s + '%,' + p.color.hsl.l + '%,' + opacity + ')';
          pJS_obj.canvas.ctx.fillStyle = color_value;
          pJS_obj.canvas.ctx.beginPath();
          switch (p.shape) {
            case 'circle': pJS_obj.canvas.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2, false); break;
            case 'edge': pJS_obj.canvas.ctx.rect(p.x - radius, p.y - radius, radius * 2, radius * 2); break;
          }
          pJS_obj.canvas.ctx.closePath();
          if (pJS_obj.particles.shape.stroke.width > 0) { pJS_obj.canvas.ctx.strokeStyle = pJS_obj.particles.shape.stroke.color;
            pJS_obj.canvas.ctx.lineWidth = pJS_obj.particles.shape.stroke.width;
            pJS_obj.canvas.ctx.stroke(); }
          pJS_obj.canvas.ctx.fill();
        };

        pJS_obj.fn.particlesCreate = function() { for (let i = 0; i < pJS_obj.particles.number.value; i++) { pJS_obj.particles.array.push(new (pJS_obj.fn.particle as any)(pJS_obj.particles.color, pJS_obj.particles.opacity.value)); } };
        
        pJS_obj.fn.particlesUpdate = function() {
          for (let i = 0; i < pJS_obj.particles.array.length; i++) {
            const p = pJS_obj.particles.array[i];
            
            // DYNAMIC BURST ATTRACTION LOGIC (Even subtler)
            if (pJS_obj.tmp.isAttracting && pJS_obj.tmp.clickX && pJS_obj.tmp.mouseDownTime) {
                const elapsed = Date.now() - pJS_obj.tmp.mouseDownTime;
                const timeFactor = Math.min(elapsed / 600, 1.0); 
                
                // Even narrower radius
                const attractionRadius = 20 + (timeFactor * 70); // Max 90px
                const attractionStrength = 15 - (timeFactor * 5); 

                const dx = p.x - pJS_obj.tmp.clickX;
                const dy = p.y - pJS_obj.tmp.clickY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < attractionRadius) {
                    // Even slower, more gradual attraction
                    const moveSpeed = Math.max(attractionStrength + 5, 15);
                    p.x -= dx / moveSpeed;
                    p.y -= dy / moveSpeed;
                }

            }








            if (pJS_obj.particles.move.enable) { const ms = pJS_obj.particles.move.speed / 2;
              p.x += p.vx * ms;
              p.y += p.vy * ms; }
            if (pJS_obj.particles.opacity.anim.enable) {
              if (p.opacity_status == true) { if (p.opacity >= pJS_obj.particles.opacity.value) p.opacity_status = false;
                p.opacity += p.vo; } else { if (p.opacity <= pJS_obj.particles.opacity.anim.opacity_min) p.opacity_status = true;
                p.opacity -= p.vo; } if (p.opacity < 0) p.opacity = 0;
            }
            if (pJS_obj.particles.size.anim.enable) {
              if (p.size_status == true) { if (p.radius >= pJS_obj.particles.size.value) p.size_status = false;
                p.radius += p.vs; } else { if (p.radius <= pJS_obj.particles.size.anim.size_min) p.size_status = true;
                p.radius -= p.vs; } if (p.radius < 0) p.radius = 0;
            }
            const new_pos = pJS_obj.particles.move.out_mode == 'bounce' ? { x_left: p.radius, x_right: pJS_obj.canvas.w, y_top: p.radius, y_bottom: pJS_obj.canvas.h } : { x_left: -p.radius, x_right: pJS_obj.canvas.w + p.radius, y_top: -p.radius, y_bottom: pJS_obj.canvas.h + p.radius };
            if (p.x - p.radius > pJS_obj.canvas.w) { p.x = new_pos.x_left;
              p.y = Math.random() * pJS_obj.canvas.h; } else if (p.x + p.radius < 0) { p.x = new_pos.x_right;
              p.y = Math.random() * pJS_obj.canvas.h; } if (p.y - p.radius > pJS_obj.canvas.h) { p.y = new_pos.y_top;
              p.x = Math.random() * pJS_obj.canvas.w; } else if (p.y + p.radius < 0) { p.y = new_pos.y_bottom;
              p.x = Math.random() * pJS_obj.canvas.w; }
            
            if (pJS_obj.particles.line_linked.enable) {
              for (let j = i + 1; j < pJS_obj.particles.array.length; j++) {
                const p2 = pJS_obj.particles.array[j];
                pJS_obj.fn.interact.linkParticles(p, p2);
              }
            }
          }
        };

        pJS_obj.fn.interact.linkParticles = function(p1: any, p2: any) {
          const dx = p1.x - p2.x, dy = p1.y - p2.y, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= pJS_obj.particles.line_linked.distance) {
            const opacity_line = pJS_obj.particles.line_linked.opacity - (dist / (1 / pJS_obj.particles.line_linked.opacity)) / pJS_obj.particles.line_linked.distance;
            if (opacity_line > 0) {
              const color_line = pJS_obj.particles.line_linked.color_rgb_line;
              pJS_obj.canvas.ctx.strokeStyle = 'rgba(' + color_line.r + ',' + color_line.g + ',' + color_line.b + ',' + opacity_line + ')';
              pJS_obj.canvas.ctx.lineWidth = pJS_obj.particles.line_linked.width;
              pJS_obj.canvas.ctx.beginPath();
              pJS_obj.canvas.ctx.moveTo(p1.x, p1.y);
              pJS_obj.canvas.ctx.lineTo(p2.x, p2.y);
              pJS_obj.canvas.ctx.stroke();
              pJS_obj.canvas.ctx.closePath();
            }
          }
        };

        pJS_obj.fn.particlesDraw = function() {
          pJS_obj.canvas.ctx.clearRect(0, 0, pJS_obj.canvas.w, pJS_obj.canvas.h);
          pJS_obj.fn.particlesUpdate();
          for (let i = 0; i < pJS_obj.particles.array.length; i++) { pJS_obj.particles.array[i].draw(); }
        };

        pJS_obj.fn.particlesEmpty = function() { pJS_obj.particles.array = []; };

        pJS_obj.fn.vendors.densityAutoParticles = function() {
          if (pJS_obj.particles.number.density.enable) {
            let area = pJS_obj.canvas.el.width * pJS_obj.canvas.el.height / 1000;
            if (pJS_obj.tmp.retina) { area = area / (pJS_obj.canvas.pxratio * 2); }
            const nb_particles = area * pJS_obj.particles.number.value / pJS_obj.particles.number.density.value_area;
            const missing_particles = pJS_obj.particles.array.length - nb_particles;
            if (missing_particles < 0) pJS_obj.fn.modes.pushParticles(Math.abs(missing_particles));
            else pJS_obj.fn.modes.removeParticles(missing_particles);
          }
        };

        pJS_obj.fn.modes.pushParticles = function(nb: number, pos?: any) {
          pJS_obj.tmp.pushing = true;
          for (let i = 0; i < nb; i++) {
            pJS_obj.particles.array.push(new (pJS_obj.fn.particle as any)(pJS_obj.particles.color, pJS_obj.particles.opacity.value, { 'x': pos ? pos.pos_x : Math.random() * pJS_obj.canvas.w, 'y': pos ? pos.pos_y : Math.random() * pJS_obj.canvas.h }));
            if (i == nb - 1) { if (!pJS_obj.particles.move.enable) { pJS_obj.fn.particlesDraw(); }
              pJS_obj.tmp.pushing = false; }
          }
        };

        pJS_obj.fn.modes.removeParticles = function(nb: number) {
          pJS_obj.particles.array.splice(0, nb);
          if (!pJS_obj.particles.move.enable) { pJS_obj.fn.particlesDraw(); }
        };

        pJS_obj.fn.vendors.eventsListeners = function() {
          pJS_obj.interactivity.el = pJS_obj.interactivity.detect_on == 'window' ? window : pJS_obj.canvas.el;
          if (pJS_obj.interactivity.events.onhover.enable || pJS_obj.interactivity.events.onclick.enable) {
            pJS_obj.interactivity.el.addEventListener('mousemove', function(e: any) {
              const pos_x = pJS_obj.interactivity.el == window ? e.clientX : (e.offsetX || e.clientX);
              const pos_y = pJS_obj.interactivity.el == window ? e.clientY : (e.offsetY || e.clientY);
              pJS_obj.interactivity.mouse.pos_x = pos_x;
              pJS_obj.interactivity.mouse.pos_y = pos_y;
              if (pJS_obj.tmp.retina) { pJS_obj.interactivity.mouse.pos_x *= pJS_obj.canvas.pxratio;
                pJS_obj.interactivity.mouse.pos_y *= pJS_obj.canvas.pxratio; }
              pJS_obj.interactivity.status = 'mousemove';
            });
          }
        };

        pJS_obj.fn.vendors.draw = function() {
          pJS_obj.fn.particlesDraw();
          pJS_obj.tmp.drawAnimFrame = requestAnimationFrame(() => pJS_obj.fn.vendors.draw());
        };

        pJS_obj.fn.vendors.checkOverlap = function(p1: any, position?: any) {
          for (let i = 0; i < pJS_obj.particles.array.length; i++) {
            const p2 = pJS_obj.particles.array[i];
            const dx = p1.x - p2.x, dy = p1.y - p2.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= p1.radius + p2.radius) {
              // Fix: Randomize NEAR the position instead of exactly on it to avoid infinite loops and scattering
              p1.x = position ? position.x + (Math.random() - 0.5) * 100 : Math.random() * pJS_obj.canvas.w;
              p1.y = position ? position.y + (Math.random() - 0.5) * 100 : Math.random() * pJS_obj.canvas.h;
              pJS_obj.fn.vendors.checkOverlap(p1);
            }
          }
        };


        pJS_obj.fn.vendors.init = function() {
          pJS_obj.fn.retinaInit();
          pJS_obj.fn.canvasInit();
          pJS_obj.fn.canvasSize();
          pJS_obj.fn.particlesCreate();
          pJS_obj.fn.vendors.densityAutoParticles();
          
          const hexToRgb = (hex: string) => {
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) { return r + r + g + g + b + b; });
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
          };
          pJS_obj.particles.line_linked.color_rgb_line = hexToRgb(pJS_obj.particles.line_linked.color);
        };

        pJS_obj.fn.vendors.start = function() {
          pJS_obj.fn.vendors.init();
          pJS_obj.fn.vendors.draw();
        };

        pJS_obj.fn.vendors.eventsListeners();
        pJS_obj.fn.vendors.start();
        
        // Expose to window for external control
        (window as any).pJSDom = (window as any).pJSDom || [];
        (window as any).pJSDom.push({ pJS: pJS_obj });
      };

      const particlesJS = (tag_id: string, params: any) => {
        const pJS_tag = document.getElementById(tag_id);
        if (!pJS_tag) return;
        const exist_canvas = pJS_tag.getElementsByClassName('particles-js-canvas-el');
        if (exist_canvas.length) { while (exist_canvas.length > 0) { pJS_tag.removeChild(exist_canvas[0]); } }
        const canvas_el = document.createElement('canvas');
        canvas_el.className = 'particles-js-canvas-el';
        canvas_el.style.width = "100%";
        canvas_el.style.height = "100%";
        pJS_tag.appendChild(canvas_el);
        new (pJS as any)(tag_id, params);
      };

      particlesJS("particles-js", {
        "particles": {
          "number": { "value": 250, "density": { "enable": true, "value_area": 700 } },
          "color": { "value": "#72ddf7" },
          "shape": { "type": ["circle", "edge"] },
          "opacity": { "value": 1.0, "random": false, "anim": { "enable": false, "speed": 1, "opacity_min": 0.1, "sync": false } },
          "size": { "value": 3, "random": true, "anim": { "enable": false, "speed": 40, "size_min": 1, "sync": false } },
          "line_linked": { "enable": true, "distance": 100, "color": "#72ddf7", "opacity": 1.0, "width": 1.5 },
          "move": { "enable": true, "speed": 1, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": true, "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 } }
        },
        "interactivity": {
          "detect_on": "canvas",
          "events": { 
            "onhover": { "enable": true, "mode": "grab" }, 
            "onclick": { "enable": true, "mode": "push" }, 
            "resize": true 
          },
          "modes": {
            "grab": { "distance": 180, "line_linked": { "opacity": 1 } },
            "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 },
            "repulse": { "distance": 200, "duration": 0.4 },
            "push": { "particles_nb": 4 },
            "remove": { "particles_nb": 2 }
          }
        },
        "retina_detect": true
      });
    };

    initParticles();

    const particlesContainer = document.getElementById("particles-js");
    if (particlesContainer) {
      const targetCount = 250;
      let sequenceTimeout: any = null;
      let attractionTimeout: any = null;

      const handleMouseDown = () => {
        if ((window as any).pJSDom && (window as any).pJSDom[0]) {
          const pJS = (window as any).pJSDom[0].pJS;
          
          // Clear any ongoing return-to-baseline sequence
          clearTimeout(sequenceTimeout);
          clearTimeout(attractionTimeout);
          
          // Trigger discrete event
          pJS.tmp.isMouseDown = true;
          pJS.tmp.mouseDownTime = Date.now();
          pJS.tmp.clickX = pJS.interactivity.mouse.pos_x;
          pJS.tmp.clickY = pJS.interactivity.mouse.pos_y;
          pJS.particles.move.speed = 2; // Reduced speed on click
          pJS.tmp.isAttracting = true;

          pJS.interactivity.modes.grab.distance = 400;
          
          // Add a few particles once at the click position
          if (pJS.particles.array.length < 500) {
            pJS.fn.modes.pushParticles(5, { 
              pos_x: pJS.tmp.clickX, 
              pos_y: pJS.tmp.clickY 
            });
          }




          // Attraction burst duration
          attractionTimeout = setTimeout(() => {
            pJS.tmp.isAttracting = false;
            pJS.interactivity.modes.grab.distance = 180;
          }, 600);

          // Return to baseline after 1.5 seconds
          sequenceTimeout = setTimeout(() => {
            pJS.particles.move.speed = 1;
            pJS.tmp.isMouseDown = false;
            pJS.tmp.mouseDownTime = 0;
            
            // Gradually remove the added particles if we are above baseline
            const excess = pJS.particles.array.length - targetCount;
            if (excess > 0) {
              pJS.fn.modes.removeParticles(excess);
            }
          }, 1500);
        }
      };
      
      const handleMouseUp = () => {
        // We let the sequenceTimeout handle the reset for a consistent feel
        // but we can ensure the mouseDown flag is cleared if needed.
      };

      particlesContainer.addEventListener('mousedown', handleMouseDown);
      particlesContainer.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        particlesContainer.removeEventListener('mousedown', handleMouseDown);
        particlesContainer.removeEventListener('mouseup', handleMouseUp);
        clearTimeout(sequenceTimeout);
        clearTimeout(attractionTimeout);
        (window as any).pJSDom = [];
      };
    }
  }, []);


  return (
    <div 
      id="particles-js" 
      className={className || "fixed inset-0 w-full h-full z-0"} 
    />
  );
};

export default ParticlesBackground;

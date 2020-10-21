export default {
  name: "Sim",
  uniforms: {
    time: {
      value: 0
    },
    oldPositions: {
      value: null
    },
    positions: {
      value: null
    },
    initial: {
      value: null
    },
    uForcePosition: {
      value: [0, 0, 0]
    }
  },
  vertexShader: `
      precision highp float;
      varying vec2 vUv;
  
      void main() {
          vUv = uv;
          gl_Position = vec4( position, 1.0 );
      }
    `,
  fragmentShader: `
      precision highp float;
      uniform sampler2D initial;
      uniform sampler2D positions;
      uniform sampler2D oldPositions;
      uniform vec3 uForcePosition;
      uniform float time;
      varying vec2 vUv;
  
      float hash(float n) { return fract(sin(n) * 1e4); }
      float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
  
      // curlNoise
      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
  
      vec2 mod289(vec2 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
  
      vec3 permute(vec3 x) {
        return mod289(((x*34.0)+1.0)*x);
      }
  
      float noise(vec2 v)
      {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
        // First corner
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
  
        // Other corners
        vec2 i1;
        //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
        //i1.y = 1.0 - i1.x;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        // x0 = x0 - 0.0 + 0.0 * C.xx ;
        // x1 = x0 - i1 + 1.0 * C.xx ;
        // x2 = x0 - 1.0 + 2.0 * C.xx ;
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
  
        // Permutations
        i = mod289(i); // Avoid truncation effects in permutation
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
  
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
  
        // Gradients: 41 points uniformly over a line, mapped onto a diamond.
        // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
  
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
  
        // Normalise gradients implicitly by scaling m
        // Approximation of: m *= inversesqrt( a0*a0 + h*h );
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  
        // Compute final noise value at P
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
  
      vec3 curl(float	x,	float	y,	float	z)
      {
        float	eps	= 1., eps2 = 2. * eps;
        float	n1,	n2,	a,	b;
  
        x += time * .05;
        y += time * .05;
        z += time * .05;
  
        vec3	curl = vec3(0.);
  
        n1	=	noise(vec2( x,	y	+	eps ));
        n2	=	noise(vec2( x,	y	-	eps ));
        a	=	(n1	-	n2)/eps2;
  
        n1	=	noise(vec2( x,	z	+	eps));
        n2	=	noise(vec2( x,	z	-	eps));
        b	=	(n1	-	n2)/eps2;
  
        curl.x	=	a	-	b;
  
        n1	=	noise(vec2( y,	z	+	eps));
        n2	=	noise(vec2( y,	z	-	eps));
        a	=	(n1	-	n2)/eps2;
  
        n1	=	noise(vec2( x	+	eps,	z));
        n2	=	noise(vec2( x	+	eps,	z));
        b	=	(n1	-	n2)/eps2;
  
        curl.y	=	a	-	b;
  
        n1	=	noise(vec2( x	+	eps,	y));
        n2	=	noise(vec2( x	-	eps,	y));
        a	=	(n1	-	n2)/eps2;
  
        n1	=	noise(vec2(  y	+	eps,	z));
        n2	=	noise(vec2(  y	-	eps,	z));
        b	=	(n1	-	n2)/eps2;
  
        curl.z	=	a	-	b;
  
        return	curl;
      }
  
      vec3 getForce(vec3 pCenter, float radius) {
        vec3 forceFieldPosition = uForcePosition;
        forceFieldPosition.y *= -1.0;
        forceFieldPosition.z = 0.5;
        float distanceToParticle = distance(pCenter, forceFieldPosition);
        float forceFieldRadius = abs(radius);
  
        float distanceToForceFieldRadius = forceFieldRadius - distanceToParticle;
        distanceToForceFieldRadius = max(distanceToForceFieldRadius, 0.0);
        distanceToForceFieldRadius *= sign(radius);
  
        vec3 directionToParticle = normalize(pCenter - forceFieldPosition);
        return directionToParticle * distanceToForceFieldRadius;
      }
  
      void main() {
        vec2 p = vUv;
        vec4 orig = texture2D( initial, vUv );
        vec4 pos = texture2D( positions, vUv );
        //vec4 old = texture2D( oldPositions , vUv );
  
        // force
        vec3 force = getForce(pos.xyz, .15)*0.05;
        //pos.xyz += force;
        
       
        // strange attractor
        float timestep = 0.005;
        float x = pos.x;
        float y = pos.y;
        float z = pos.z;
        float dx = 0.0; float dy = 0.0; float dz = 0.0;
        
        // attractor parameters
        float a = -5.5;
        float b = 3.5;
        float d = -1.;
                
        dx = y * timestep;
        dy = z * timestep;
        dz = (-a*x -b*y -z + (d* (pow(x, 3.)))) * timestep;
        
        // Add the new increments to the previous position
        vec3 attractorForce = vec3(dx, dy, dz) ;
        //pos.xyz += attractorForce;

        // curl noise
        vec3 warp = curl(pos.x*4., pos.y*4., pos.z*4.)*0.0025;
        //pos.xyz += warp;
        pos.z += 0.001;

        // random reset particle
        if (hash(p+time) > 0.997) {
          pos = orig;
        }
        
        //float d = length(p);
        //gl_FragColor = vec4(vec3(mix(pos.xyz, orig.xyz, d*d)),1.0);
        gl_FragColor = vec4(vec3(pos.xyz),1.0);
      }
    `
}

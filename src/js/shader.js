let vertex_shader='precision highp float;\
		attribute vec2 aVertexPosition;\
		attribute vec2 aTextureCoord;\
		uniform mat3 projectionMatrix;\
		uniform mat3 translationMatrix;\
		uniform mat3 uTextureMatrix;\
		varying vec3 vTextureCoord;\
		varying float vColor;\
		void main(void)\
		{\
			gl_Position.xyw = projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0);\
			gl_Position.z = 0.0;\
			vColor=floor(aTextureCoord.x);\
			vTextureCoord = vec3(aVertexPosition.x,(aTextureCoord.x-vColor)/.5,aTextureCoord.y);\
		}';

		// vTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;
let frag_shader="varying vec3 vTextureCoord;\
	varying float vColor;\
	uniform vec4 uColor;\
	uniform sampler2D uSampler;\
	uniform float width;\
	\
	uniform vec4 roadColor1;\
	uniform vec4 roadColor2;\
	uniform vec4 laneColor1;\
	uniform vec4 laneColor2;\
	uniform vec4 grassColor1;\
	uniform vec4 grassColor2;\
	uniform vec4 grassColor3;\
	uniform vec4 grassColor4;\
	uniform vec4 sideColor1;\
	uniform vec4 sideColor2;\
	vec4 shadowColor=vec4(0.6,0.6,0.6,0.0);\
	\
	float pix=10.0;\
	float seglength=400.0;\
	float sidelength=60.0;\
	bool isBorder(float x,float y){\
		float xx=mod(x,pix*4.0)/pix;\
		if(y*seglength<pix){\
			if(xx<=1.0 || (xx>=2.0 && xx<=3.0)) return true;\
		}else if(y*seglength<pix*2.0 && y*seglength>=pix){\
			if(xx>=1.0 && xx<=2.0) return true;\
		}else if(y*seglength>seglength-pix*2.0){\
			if(y*seglength>seglength-pix){\
				if(xx<=1.0) return true;\
			}else{\
				if(xx>=2.0 && xx<=3.0) return true;\
			}\
		}\
		return false;\
	}\
	void main(void){\
		if(vColor<1.0){\
			gl_FragColor=roadColor1;\
			if(isBorder(vTextureCoord.x,vTextureCoord.z))\
				gl_FragColor=roadColor2;\
			\
		}else if(vColor<2.0){\
			gl_FragColor=roadColor2;\
			if(isBorder(vTextureCoord.x,vTextureCoord.z))\
				gl_FragColor=roadColor1;\
			\
		}else if(vColor<3.0){\
			gl_FragColor=laneColor1;\
			if(vTextureCoord.y*sidelength>sidelength-pix) gl_FragColor-=shadowColor/2.0;\
		}else if(vColor<4.0){\
		 gl_FragColor=(vTextureCoord.y<.5)?grassColor1:grassColor3;\
		 if(isBorder(vTextureCoord.x,vTextureCoord.z))\
				gl_FragColor=(vTextureCoord.y<.5)?grassColor2:grassColor4;\
		}else if(vColor<5.0){\
		 gl_FragColor=(vTextureCoord.y<.5)?grassColor2:grassColor4;\
		 if(isBorder(vTextureCoord.x,vTextureCoord.z))\
				gl_FragColor=(vTextureCoord.y<.5)?grassColor1:grassColor3;\
		}else if(vColor<6.0){\
			if(vTextureCoord.z<.33 ||vTextureCoord.z>.66) gl_FragColor=sideColor1;\
			else gl_FragColor=sideColor2;\
			if(vTextureCoord.y*sidelength>sidelength-pix) gl_FragColor-=shadowColor;\
		}else if(vColor<7.0){\
			if(vTextureCoord.z<.33 ||vTextureCoord.z>.66) gl_FragColor=sideColor2;\
			else gl_FragColor=sideColor1;\
			if(vTextureCoord.y*sidelength>sidelength-pix) gl_FragColor-=shadowColor;\
		}else if(vColor<8.0){\
			gl_FragColor=laneColor2;\
			if(vTextureCoord.y*sidelength>sidelength-pix) gl_FragColor-=shadowColor/2.0;\
		}\
	}";


// let vertex_shader='precision highp float;\
// 					attribute vec2 aVertexPosition;\
// 					attribute vec2 aTextureCoord;\
// 					uniform mat3 projectionMatrix;\
// 					uniform mat3 translationMatrix;\
// 					uniform mat3 uTextureMatrix;\
// 					varying vec2 vTextureCoord;\
// 					void main(void)\
// 					{\
// 						gl_Position.xyw = projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0);\
// 						gl_Position.z = 0.0;\
// 						vTextureCoord = aTextureCoord;\
// 					}';
	
// 					// vTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;
// let frag_shader="varying vec2 vTextureCoord;\
// 				uniform vec4 uColor;\
// 				uniform sampler2D uSampler;\
// 				\
// 				void main(void){\
// 					gl_FragColor = texture2D(uSampler, vTextureCoord) * uColor;\
// 				}";
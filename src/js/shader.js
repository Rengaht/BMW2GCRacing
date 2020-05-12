function colorArray(arr_){
	return new Float32Array(arr_.map(x=>x/255));
}

var SceneColor=[
{
	roadColor1:colorArray([185,184,185,255]),
	roadColor2:colorArray([151,150,150,255]),
	laneColor1:colorArray([255,255,255,255]),
	laneColor2:colorArray([227,227,227,255]),
	grassColor1:colorArray([82,188,127,255]),
	grassColor2:colorArray([144,204,136,255]),
	grassColor3:colorArray([82,188,127,255]),
	grassColor4:colorArray([144,204,136,255]),
	sideColor1:colorArray([228,58,56,255]),
	sideColor2:colorArray([250,229,221,255])
},
{
	roadColor1:colorArray([14,74,94,255]),
	roadColor2:colorArray([0,53,79,255]),
	laneColor1:colorArray([254,229,110,255]),
	laneColor2:colorArray([15,180,223,255]),
	grassColor1:colorArray([45,44,130,255]),
	grassColor2:colorArray([30,67,153,255]),
	grassColor3:colorArray([45,44,130,255]),
	grassColor4:colorArray([30,67,153,255]),
	sideColor1:colorArray([195,124,180,255]),
	sideColor2:colorArray([255,245,229,255])
},
{
	roadColor1:colorArray([131,82,161,255]),
	roadColor2:colorArray([106,84,163,255]),
	laneColor1:colorArray([124,209,233,255]),
	laneColor2:colorArray([76,166,221,255]),
	grassColor1:colorArray([229,211,181,255]),
	grassColor2:colorArray([255,235,207,255]),
	grassColor3:colorArray([125,207,218,255]),
	grassColor4:colorArray([89,167,220,255]),
	sideColor1:colorArray([131,45,145,255]),
	sideColor2:colorArray([230,50,147,255])
}];

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
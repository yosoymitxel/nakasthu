// Las clases armadas con ${…} no las ve el escáner: van en safelist.
// Fuente de src/ui/styles/tailwind.css: tras tocar clases o esto, `npm run build:css`.
module.exports = {
  "content": [
    "./index.html",
    "./src/**/*.{js,mjs,json}"
  ],
  "safelist": [
    { pattern: /^(text|bg)-(amber|purple|indigo|red|cyan)-500$/ },
    "border-purple-500/60", "border-cyan-500/60", "ring-purple-500/30", "ring-cyan-500/30",
    "via-purple-400/60", "via-cyan-500/40"
  ],
  "theme": {
    "extend": {
      "colors": {
        "nakasthu": {
          "black": "#050505",
          "carbon": "#0a0a0a",
          "panel": "#111111",
          "amber": "#FF8C00",
          "cyan": "#00FFFF",
          "red": "#FF0000"
        }
      },
      "fontFamily": {
        "mono": [
          "\"JetBrains Mono\"",
          "monospace"
        ]
      },
      "animation": {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glitch": "glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite",
        "scanline": "scanline 8s linear infinite",
        "scanline-h": "scanline-h 4s linear infinite",
        "shake": "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
        "float": "float 6s ease-in-out infinite",
        "neural-scan": "neural-scan 4s linear infinite",
        "loading-bar": "loading-bar 2s ease-in-out infinite",
        "glitch-line": "glitch-line 2s linear infinite",
        "glitch-line-delayed": "glitch-line 2.5s linear infinite 0.5s",
        "scan-line": "scan-line 4s linear infinite",
        "vibrate-subtle": "vibrate-subtle 0.15s linear infinite",
        "pulse-border-critical": "pulse-border-critical 2s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "spin-slow": "spin 10s linear infinite",
        "slow-spin": "spin 15s linear infinite",
        "ritual-glow": "ritual-glow 4s ease-in-out infinite",
        "whisper-flow": "whisper-flow 8s ease-in-out infinite",
        "float-slow": "float 10s ease-in-out infinite"
      },
      "keyframes": {
        "ritual-glow": {
          "0%, 100%": {
            "opacity": "0.3",
            "filter": "blur(5px) brightness(1)"
          },
          "50%": {
            "opacity": "0.7",
            "filter": "blur(10px) brightness(1.5)"
          }
        },
        "whisper-flow": {
          "0%, 100%": {
            "transform": "translateX(-5%) translateY(0)",
            "opacity": "0.2"
          },
          "50%": {
            "transform": "translateX(5%) translateY(-10px)",
            "opacity": "0.5"
          }
        },
        "fade-in": {
          "0%": {
            "opacity": "0",
            "transform": "scale(0.98)"
          },
          "100%": {
            "opacity": "1",
            "transform": "scale(1)"
          }
        },
        "vibrate-subtle": {
          "0%, 100%": {
            "transform": "translate(0)"
          },
          "25%": {
            "transform": "translate(-0.5px, 0.5px)"
          },
          "50%": {
            "transform": "translate(0.5px, -0.5px)"
          },
          "75%": {
            "transform": "translate(-0.5px, -0.5px)"
          }
        },
        "pulse-border-critical": {
          "0%, 100%": {
            "opacity": "0.2",
            "borderWidth": "4px"
          },
          "50%": {
            "opacity": "0.6",
            "borderWidth": "8px"
          }
        },
        "float": {
          "0%, 100%": {
            "transform": "translateY(0)"
          },
          "50%": {
            "transform": "translateY(-20px)"
          }
        },
        "neural-scan": {
          "0%": {
            "transform": "translateY(-100%)"
          },
          "100%": {
            "transform": "translateY(500%)"
          }
        },
        "loading-bar": {
          "0%": {
            "transform": "translateX(-100%)"
          },
          "100%": {
            "transform": "translateX(100%)"
          }
        },
        "glitch-line": {
          "0%": {
            "transform": "translateX(-100%)",
            "opacity": "0"
          },
          "50%": {
            "opacity": "0.5"
          },
          "100%": {
            "transform": "translateX(100%)",
            "opacity": "0"
          }
        },
        "scan-line": {
          "0%": {
            "top": "0"
          },
          "100%": {
            "top": "100%"
          }
        },
        "glitch": {
          "0%": {
            "transform": "translate(0)"
          },
          "20%": {
            "transform": "translate(-2px, 2px)"
          },
          "40%": {
            "transform": "translate(-2px, -2px)"
          },
          "60%": {
            "transform": "translate(2px, 2px)"
          },
          "80%": {
            "transform": "translate(2px, -2px)"
          },
          "100%": {
            "transform": "translate(0)"
          }
        },
        "scanline": {
          "0%": {
            "transform": "translateY(-100%)"
          },
          "100%": {
            "transform": "translateY(100%)"
          }
        },
        "scanline-h": {
          "0%": {
            "transform": "translateX(-100%)"
          },
          "100%": {
            "transform": "translateX(500%)"
          }
        },
        "shake": {
          "10%, 90%": {
            "transform": "translate3d(-1px, 0, 0)"
          },
          "20%, 80%": {
            "transform": "translate3d(2px, 0, 0)"
          },
          "30%, 50%, 70%": {
            "transform": "translate3d(-4px, 0, 0)"
          },
          "40%, 60%": {
            "transform": "translate3d(4px, 0, 0)"
          }
        }
      }
    }
  }
};

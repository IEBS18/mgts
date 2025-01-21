// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   darkMode: ["class"],
//   content: [
//     './pages/**/*.{js,jsx}',
//     './components/**/*.{js,jsx}',
//     './app/**/*.{js,jsx}',
//     './src/**/*.{js,jsx}',
//   ],
//   prefix: "",
//   theme: {
//   	container: {
//   		center: 'true',
//   		padding: '2rem',
//   		screens: {
//   			'2xl': '1400px'
//   		}
//   	},
//   	extend: {
		
// 		backgroundImage: {
// 			  'custom-gradient': 'linear-gradient(157.85deg, #95D524 8.43%, #2AC4F7 46.59%)',
// 			},
// 		boxShadow: {
// 			  'custom': '0 4px 6px rgba(0, 0, 0, 0.35)', // Adjust the values as needed
// 			  'custom-shadow': '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
// 			},
//   		colors: {
// 			green: '#95d524',
// 			lightBlue: '#29c4f8',
// 			darkBlue: '#04165d',
//   			border: 'hsl(var(--border))',
//   			input: 'hsl(var(--input))',
//   			ring: 'hsl(var(--ring))',
//   			background: 'hsl(var(--background))',
//   			foreground: 'hsl(var(--foreground))',
//   			primary: {
//   				DEFAULT: 'hsl(var(--primary))',
//   				foreground: 'hsl(var(--primary-foreground))'
//   			},
//   			secondary: {
//   				DEFAULT: 'hsl(var(--secondary))',
//   				foreground: 'hsl(var(--secondary-foreground))'
//   			},
//   			destructive: {
//   				DEFAULT: 'hsl(var(--destructive))',
//   				foreground: 'hsl(var(--destructive-foreground))'
//   			},
//   			muted: {
//   				DEFAULT: 'hsl(var(--muted))',
//   				foreground: 'hsl(var(--muted-foreground))'
//   			},
//   			accent: {
//   				DEFAULT: 'hsl(var(--accent))',
//   				foreground: 'hsl(var(--accent-foreground))'
//   			},
//   			popover: {
//   				DEFAULT: 'hsl(var(--popover))',
//   				foreground: 'hsl(var(--popover-foreground))'
//   			},
//   			card: {
//   				DEFAULT: 'hsl(var(--card))',
//   				foreground: 'hsl(var(--card-foreground))'
//   			},
//   			chart: {
//   				'1': 'hsl(var(--chart-1))',
//   				'2': 'hsl(var(--chart-2))',
//   				'3': 'hsl(var(--chart-3))',
//   				'4': 'hsl(var(--chart-4))',
//   				'5': 'hsl(var(--chart-5))'
//   			}
//   		},
//   		borderRadius: {
//   			lg: '12px',
//   			md: 'calc(var(--radius) - 2px)',
//   			sm: 'calc(var(--radius) - 4px)'
//   		},
//   		keyframes: {
//   			'accordion-down': {
//   				from: {
//   					height: '0'
//   				},
//   				to: {
//   					height: 'var(--radix-accordion-content-height)'
//   				}
//   			},
//   			'accordion-up': {
//   				from: {
//   					height: 'var(--radix-accordion-content-height)'
//   				},
//   				to: {
//   					height: '0'
//   				}
//   			}
//   		},
//   		animation: {
//   			'accordion-down': 'accordion-down 0.2s ease-out',
//   			'accordion-up': 'accordion-up 0.2s ease-out'
//   		}
//   	}
//   },
//   plugins: [require("tailwindcss-animate")],
// }


/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  './pages/**/*.{js,jsx}',
	  './components/**/*.{js,jsx}',
	  './app/**/*.{js,jsx}',
	  './src/**/*.{js,jsx}',
	],
	prefix: "",
	theme: {
	  container: {
		center: 'true',
		padding: '2rem',
		screens: {
		  '2xl': '1400px'
		}
	  },
	  extend: {
		backgroundImage: {
		  'custom-gradient': 'linear-gradient(157.85deg, #95D524 8.43%, #2AC4F7 46.59%)',
		  'custom-gradient-card': 'linear-gradient(36.59deg, #A6CE39 2.62%, #40530C 92.34%)',
	      'gradient-alt-ego': 'linear-gradient(36.59deg, #40530C 2.62%, #A6CE39 92.34%)',
		},
		boxShadow: {
		  'custom': '0 4px 6px rgba(0, 0, 0, 0.35)',
		  'custom-shadow': '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
		},
		colors: {
		  // Extending the green palette
		  green: {
			50: '#E6F4EA',
			100: '#C3E8C0',
			200: '#A0DB96',
			300: '#7DC06C',
			400: '#5BA542',
			500: '#95D524', // Your custom green
			600: '#3B8F2A',
			700: '#2F6D1F',
			800: '#235B18',
			900: '#1A4E12',
		  },
		  lightBlue: '#29c4f8',
		  darkBlue: '#04165d',
		  // Retaining other custom colors
		  border: 'hsl(var(--border))',
		  input: 'hsl(var(--input))',
		  ring: 'hsl(var(--ring))',
		  background: 'hsl(var(--background))',
		  foreground: 'hsl(var(--foreground))',
		  primary: {
			DEFAULT: 'hsl(var(--primary))',
			foreground: 'hsl(var(--primary-foreground))'
		  },
		  secondary: {
			DEFAULT: 'hsl(var(--secondary))',
			foreground: 'hsl(var(--secondary-foreground))'
		  },
		  destructive: {
			DEFAULT: 'hsl(var(--destructive))',
			foreground: 'hsl(var(--destructive-foreground))'
		  },
		  muted: {
			DEFAULT: 'hsl(var(--muted))',
			foreground: 'hsl(var(--muted-foreground))'
		  },
		  accent: {
			DEFAULT: 'hsl(var(--accent))',
			foreground: 'hsl(var(--accent-foreground))'
		  },
		  popover: {
			DEFAULT: 'hsl(var(--popover))',
			foreground: 'hsl(var(--popover-foreground))'
		  },
		  card: {
			DEFAULT: 'hsl(var(--card))',
			foreground: 'hsl(var(--card-foreground))'
		  },
		  chart: {
			'1': 'hsl(var(--chart-1))',
			'2': 'hsl(var(--chart-2))',
			'3': 'hsl(var(--chart-3))',
			'4': 'hsl(var(--chart-4))',
			'5': 'hsl(var(--chart-5))'
		  }
		},
		borderRadius: {
		  lg: '12px',
		  md: 'calc(var(--radius) - 2px)',
		  sm: 'calc(var(--radius) - 4px)'
		},
		keyframes: {
		  'accordion-down': {
			from: { height: '0' },
			to: { height: 'var(--radix-accordion-content-height)' }
		  },
		  'accordion-up': {
			from: { height: 'var(--radix-accordion-content-height)' },
			to: { height: '0' }
		  }
		},
		animation: {
		  'accordion-down': 'accordion-down 0.2s ease-out',
		  'accordion-up': 'accordion-up 0.2s ease-out'
		}
	  }
	},
	plugins: [require("tailwindcss-animate")],
  }
  
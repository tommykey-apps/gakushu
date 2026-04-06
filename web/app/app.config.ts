export default defineAppConfig({
  ui: {
    colors: {
      primary: 'neutral',
    },
    header: {
      slots: {
        root: 'bg-white/80 backdrop-blur-md border-b border-gray-50 transition-all duration-300',
        container: 'max-w-5xl',
        title: 'text-base font-normal text-gray-400 hover:text-gray-600 transition-colors duration-300',
      },
    },
    footer: {
      slots: {
        root: 'bg-gradient-to-b from-transparent to-gray-50/60 border-t border-gray-50 py-12',
        container: 'max-w-5xl',
      },
    },
  },
})

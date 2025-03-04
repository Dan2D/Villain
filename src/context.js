import React, { Component } from 'react'
import Localization from '@/localize'
export const ReaderContext = React.createContext()

const defaultState = {
  pages: [],
  ready: false,
  focus: false,
  hover: false,
  error: null,
  totalPages: 0,
  isLastPage: false,
  isFirstPage: true,
  currentPage: null,
  currentZoom: null,
  canZoomIn: false,
  canZoomOut: false,
  renderError: false,

  // Settings
  theme: 'Dark',
  mangaMode: false,
  bookMode: false,
  fullscreen: false,
  showControls: false,
  autoHideControls: false,
  changeLang: Localization.getInterfaceLanguage(),
  allowGlobalShortcuts: false,
}

export class ReaderProvider extends Component {
  //Define deafault state and  merge external values
  state = { ...defaultState, ...this.props.defaultState }

  updateState = data => {
    this.setState(data)
  }

  toggleSetting = setting => {
    this.setState(prevState => ({ [setting]: !prevState[setting] }))
  }

  createPage = page => {
    const pages = this.state.pages.concat(page)
    if (page.index === 0) {
      this.setState({
        ready: true,
        error: null,
        currentPage: 0,
        pages,
      })
    } else {
      this.setState({ pages })
    }
  }

  trigger = (eventName, data) => {
    if (eventName === 'error' && data) {
      console.error(data)
      this.setState({ ready: false, error: data })
    }

    if (eventName === 'loaded' && data) {
      this.setState({ ...data })
    }
  }

  togglePin = () => {
    this.setState(prevState => ({
      autoHideControls: !prevState.autoHideControls,
    }))
  }

  toggleLang = lang => {
    Localization.setLanguage(lang)
    this.setState({ changeLang: lang })
  }

  toggleTheme = () => {
    this.setState(prevState => ({
      theme: prevState.theme === 'Light' ? 'Dark' : 'Light',
    }))
  }

  toggleControls(show = true) {
    this.setState({ showControls: show })
  }

  navigateToPage = pageIndex => {
    this.setState(prevState => {
      const { totalPages } = prevState
      const lastIndex = totalPages - 1
      // Validate page index
      if (pageIndex < 0 || pageIndex > lastIndex) return {}
      // Update state
      const isLastPage = pageIndex === lastIndex
      const isFirstPage = pageIndex === 0
      return { isLastPage, isFirstPage, currentPage: pageIndex }
    })
  }

  navigateForward = () => {
    const { isLastPage, currentPage } = this.state
    if (!isLastPage) {
      this.navigateToPage(currentPage + 1)
    }
  }

  navigateBackward = () => {
    const { isFirstPage, currentPage } = this.state
    if (!isFirstPage) {
      this.navigateToPage(currentPage - 1)
    }
  }

  getPage = index => {
    const { pages, bookMode, mangaMode, totalPages } = this.state
    const page = pages[index]
    const nextIndex = index + 1
    const nextPageExists = nextIndex >= 0 || nextIndex < totalPages
    const shouldRenderBookMode =
      nextPageExists && !(index === 0 || index === totalPages - 1)

    // Return two pages
    if (bookMode && shouldRenderBookMode) {
      const nextPage = pages[nextIndex]
      if (mangaMode) {
        return [nextPage, page]
      }
      return [page, nextPage]
    }

    // Return single page
    return page
  }

  render() {
    return (
      <ReaderContext.Provider
        value={{
          state: this.state,
          // Actions
          trigger: this.trigger,
          getPage: this.getPage,
          togglePin: this.togglePin,
          createPage: this.createPage,
          updateState: this.updateState,
          toggleTheme: this.toggleTheme,
          toggleLang: this.toggleLang,
          toggleSetting: this.toggleSetting,
          navigateToPage: this.navigateToPage,
          navigateForward: this.navigateForward,
          navigateBackward: this.navigateBackward,
        }}
      >
        {this.props.children}
      </ReaderContext.Provider>
    )
  }
}

//  Access context
// <ReaderContext.Consumer> { context => (<div />)}<ReaderContext.Consumer/>

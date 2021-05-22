import React from 'react'
import ImageGallery from 'react-image-gallery'
import '../../node_modules/react-image-gallery/styles/css/image-gallery.css'
import firestore from '../service/service'

interface P {}
interface S {
  images: any[]
}

class SlidesScreen extends React.Component<P, S> {
  constructor(props: P) {
    super(props)
    this.state = {
      images: []
    }
  }

  componentDidMount() {
    firestore.collection('images').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type !== 'added') return
        const newImage = change.doc.data()
        const images = this.state.images
        images.push(newImage)
        this.setState({ images })
      })
    })
  }

  render() {
    return (
      <ImageGallery
        items={this.state.images}
        showNav={false}
        showPlayButton={false}
        autoPlay={true}
        slideDuration={1200}
        slideInterval={6000}
      />
    )
  }
}

export default SlidesScreen

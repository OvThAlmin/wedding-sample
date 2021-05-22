import React from 'react'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Link, withRouter, RouteComponentProps } from 'react-router-dom'
import firestore, { storage } from '../service/service'
import firebase from 'firebase/app'

interface P extends RouteComponentProps {
  user: firebase.User | null
}
interface S {
  uploading: boolean
  photoUploading: boolean
  uploaded: boolean

  imgUrl1: string
  urls: string[]
  data: Data[]
}

interface Data {
  dlUrl?: string
  dlUrlOrigin?: string
  fileName?: string
}

const uStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },

  layout: {
    width: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
      width: 600,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  fileButton: {
    opacity: 0,
    appearance: 'none',
    position: 'absolute',
  },
}))

const sleep = (msec: any) => new Promise((resolve) => setTimeout(resolve, msec))

const FileAttachButton = (props: {
  text?: string
  onChange: (e: any) => void
}) => {
  const classes = uStyles()
  return (
    <Button
      component="label"
      style={{ marginTop: 20, display: 'flex', backgroundColor: '#DDDDDD' }}
    >
      {props.text ? props.text : '画像をアップロード'}
      <input
        type="file"
        className={classes.fileButton}
        onChange={props.onChange}
        multiple
      />
    </Button>
  )
}

class UploadImg extends React.Component<P, S> {
  constructor(props: P) {
    super(props)
    this.state = {
      uploading: false,
      photoUploading: false,
      uploaded: false,

      imgUrl1: '',
      urls: [],
      data: [],
    }
  }

  componentDidMount() {}

  FormWrapper = (props: { children: React.ReactNode }) => {
    const classes = uStyles()
    return (
      <main className={classes.layout}>
        <Paper className={classes.paper}>{props.children}</Paper>
      </main>
    )
  }

  private onSubmit = async (event: any) => {
    event.preventDefault()
    const { data } = this.state
    if (data.length === 0) {
      alert('写真をアップロードしてしてください')
      return
    }
    await this.setState({ uploading: true })
    for (const obj of data) {
      // const dlUrl = await this.getTumb(obj.fileName)
      // if (!dlUrl) return
      await firestore
        .collection('images')
        .add({
          original: obj.dlUrlOrigin, // required
          thumbnail: obj.dlUrlOrigin, // required
          // 以下はdebugとかで見る用。必要はない
          org: obj.dlUrlOrigin,
          fileName: obj.fileName,
          uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .catch((e) => {
          console.log(e)
          alert('失敗しました。時間を置いて再度選択し、再び送信して下さい')
          this.setState({ uploading: false })
        })
    }
    this.setState({ uploaded: true, uploading: false, data: [] })
  }

  // タイムアウトとか諸々考えるの面倒なのでパワープレイで何回か試す
  private getTumb = async (fileName: any) => {
    try {
      const dlUrl = await storage
        .ref('images/thumb_' + fileName)
        .getDownloadURL()
      return dlUrl
    } catch {
      try {
        await sleep(2000)
        const dlUrl = await storage
          .ref('images/thumb_' + fileName)
          .getDownloadURL()
        return dlUrl
      } catch {
        try {
          await sleep(2000)
          const dlUrl = await storage
            .ref('images/thumb_' + fileName)
            .getDownloadURL()
          return dlUrl
        } catch {
          try {
            await sleep(2000)
            const dlUrl = await storage
              .ref('images/thumb_' + fileName)
              .getDownloadURL()
            return dlUrl
          } catch {
            try {
              await sleep(2000)
              const dlUrl = await storage
                .ref('images/thumb_' + fileName)
                .getDownloadURL()
              return dlUrl
            } catch {
              alert(
                '失敗しました。混雑してるせいかもしれないので、少し待ってから再度送って下さい！'
              )
            }
          }
        }
      }
    }
  }

  private onChangeImage = async (event: any) => {
    console.log('this.state.data start', this.state.data)
    this.setState({ photoUploading: true, uploaded: false })
    const files: any[] = event.target.files
    const data: Data[] = []
    for (const file of files) {
      const obj: Data = await this.uploadImage(file)
      data.push(obj)
    }
    this.setState({
      photoUploading: false,
      data,
    })
    console.log('this.state.data finish', this.state.data)
  }

  private uploadImage = async (file: any) => {
    if (!file) return {}
    const random = Math.floor(Math.random() * Math.floor(100000))
    const fileName = 'org_' + random + '_' + file.name
    await storage.ref('images/' + fileName).put(file)
    const dlUrlOrigin = await storage.ref('images/' + fileName).getDownloadURL()
    return { dlUrlOrigin, fileName }
  }

  render() {
    return (
      <this.FormWrapper>
        <Typography
          component="h1"
          variant="h4"
          align="center"
          style={{ marginBottom: 20 }}
        >
          Sample Wedding
        </Typography>
        {!this.state.uploaded && (
          <Typography
            component="body"
            variant="body1"
            align="center"
            style={{ marginTop: 8 }}
          >
            会場の様子、昔の思い出写真、友達同士、なんでも投稿してね！
          </Typography>
        )}
        {!this.state.uploaded && (
          <Typography
            component="body"
            variant="body1"
            align="center"
            style={{ marginBottom: 8 }}
          >
            ※一度に5枚まで投稿可能
          </Typography>
        )}
        <React.Fragment>
          <form onSubmit={this.onSubmit}>
            {this.state.uploaded && (
              <Typography
                variant="body1"
                align="center"
                style={{ marginBottom: 20 }}
              >
                写真の送信が完了しました。Thank you!
              </Typography>
            )}
            <React.Fragment>
              <Grid container spacing={3}>
                {this.state.data.length > 0 && (
                  <Grid item xs={6}>
                    <img
                      src={this.state.data[0].dlUrlOrigin}
                      alt={this.state.data[0].dlUrlOrigin}
                      height="100%"
                      width="100%"
                    />
                  </Grid>
                )}
                {this.state.data.length > 1 && (
                  <Grid item xs={6}>
                    <img
                      src={this.state.data[1].dlUrlOrigin}
                      alt={this.state.data[1].dlUrlOrigin}
                      height="100%"
                      width="100%"
                    />
                  </Grid>
                )}
                {this.state.data.length > 2 && (
                  <Grid item xs={6}>
                    <img
                      src={this.state.data[2].dlUrlOrigin}
                      alt={this.state.data[2].dlUrlOrigin}
                      height="100%"
                      width="100%"
                    />
                  </Grid>
                )}
                {this.state.data.length > 3 && (
                  <Grid item xs={6}>
                    <img
                      src={this.state.data[3].dlUrlOrigin}
                      alt={this.state.data[3].dlUrlOrigin}
                      height="100%"
                      width="100%"
                    />
                  </Grid>
                )}
                {this.state.data.length > 4 && (
                  <Grid item xs={6}>
                    <img
                      src={this.state.data[4].dlUrlOrigin}
                      alt={this.state.data[4].dlUrlOrigin}
                      height="100%"
                      width="100%"
                    />
                  </Grid>
                )}
              </Grid>
              <Grid container spacing={3} justify="center">
                {this.state.data.length === 0 && (
                  <FileAttachButton
                    text={'写真をアップロード'}
                    onChange={this.onChangeImage}
                  />
                )}
              </Grid>
            </React.Fragment>

            <div>
              <Button
                disabled={
                  this.state.uploading ||
                  this.state.uploaded ||
                  this.state.photoUploading
                }
                variant="contained"
                color="primary"
                type="submit"
                style={{ marginTop: 40 }}
              >
                送信
              </Button>
              {!this.state.uploaded && (
                <Typography
                  component="body"
                  variant="body1"
                  align="center"
                  style={{ marginTop: 8, marginBottom: 8 }}
                >
                  「送信」を押すとスライドに写真が投稿されます！
                </Typography>
              )}
            </div>
            <div>{this.state.uploading && <CircularProgress />}</div>
          </form>
        </React.Fragment>
        <Link to={'/slides'}>
          <Typography component="body" variant="body1" align="center">
            投稿された写真を見る
          </Typography>
        </Link>
      </this.FormWrapper>
    )
  }
}

export default withRouter(UploadImg)

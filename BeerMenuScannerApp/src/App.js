import React from 'react';
import { Heading, Button } from '@aws-amplify/ui-react';

class App extends React.Component 
{
  state = {selectedImage: null}

  fileSelectedHandler = event =>
  {
    this.state.selectedImage = event.target.files[0];
  }

  uploadImage = () =>
  {
    const fd = new FormData();
    fd.append('image', this.state.selectedImage, this.state.selectedImage.name);
    /* Send to Lambda function from here */
  }

  render() 
  {
    return (
      <div style={{textAlign: "center"}}>
        <Heading level={1}>BEER MENU SCANNER</Heading>
        <input type="file" onChange={this.fileSelectedHandler}/>
        <Button onClick={this.uploadImage}>Upload</Button>
      </div> 
    );
  }
}

export default App;

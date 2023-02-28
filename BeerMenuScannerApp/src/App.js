import React from 'react';
import { Heading, Button } from '@aws-amplify/ui-react';

class App extends React.Component 
{
  state = { selectedImage: null, base64: "" };

  /* Get the selected image and properties */
  fileSelectedHandler = async (e) =>
  {
    this.state.selectedImage = e.target.files[0];
    console.log(this.state.selectedImage.name);

    this.state.base64 = await this.readFile(this.state.selectedImage);
    this.state.base64 = this.state.base64.replace("data:", "").replace(/^.+,/, "");
    // console.log(this.state.base64);
  }

  /* To convert the file to Base64 and returns a promise */
  readFile = (inputFile) => 
  {
    var reader = new FileReader();
  
    return new Promise((resolve, reject) => 
    {
      reader.onerror = () => 
      {
        reader.abort();
        reject(new DOMException("Problem parsing input file."));
      };
  
      reader.onload = () => 
      {
        resolve(reader.result);
      };
      reader.readAsDataURL(inputFile);
    });
  };

  /* On "Upload" click, API Gateway -> Lambda -> S3 */
  uploadImage = () =>
  {
    /* Send to Lambda function from here */
    /* Format our REST POST */
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({"ImageName": this.state.selectedImage.name, "Base64": this.state.base64});
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    /* Execute the POST */
    fetch("https://tg0hv338l5.execute-api.us-east-1.amazonaws.com/BeerMenuScanner", requestOptions)
    .then(response => response.text())
    // .then(result => alert(JSON.parse(result).statusCode + " | " + JSON.parse(result).body))
    .catch(error => console.log('error', error));
  }

  /* Get the Beer Results if they exist */
  getBeerResults = () =>
  {
    /* Call API to check for results if they exist */
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({"Key": this.state.selectedImage.name.slice(0, this.state.selectedImage.name.indexOf(".")) + ".json"});
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    /* Execute the POST */
    fetch("https://17yiu3g03f.execute-api.us-east-1.amazonaws.com/BeerMenuGet", requestOptions)
    .then(response => response.text())
    // .then(result => alert(JSON.parse(result).statusCode + " | " + JSON.parse(result).body))
    .then(result => console.log(JSON.parse(result).body))
    .catch(error => console.log('error', error));
  }

  render() 
  {
    return (
      <div>
        {/* BEER MENU SCANNER - HOME PAGE */}
        <div style={{textAlign: "center"}}>
          <Heading level={1}>BEER MENU SCANNER</Heading>
          <input type="file" onChange={this.fileSelectedHandler}/>
          <Button onClick={this.uploadImage}>Upload</Button><br></br>
          <Button onClick={this.getBeerResults}>Get Results!</Button>
        </div> 
      </div>
    );
  }
}

export default App;

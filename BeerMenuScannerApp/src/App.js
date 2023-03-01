import React from 'react';
import { Heading, Button } from '@aws-amplify/ui-react';

class App extends React.Component 
{
  state = { selectedImage: null, base64: "", beerResults: "" };
  infoDict = {"old_names": "", "correct_ratio": "", "idx": "", "Name": "", "Style": "", "ABV": "", "Ratings": "", "AVG": "", "Last Active": "", "brewery": "", "brewery_link": "", "beer_link": "", "beer_brewery": ""};
  infoDictMap = ["old_names", "correct_ratio", "idx", "Name", "Style", "ABV", "Ratings", "Avg", "Last Active", "brewery", "brewery_link", "beer_link", "beer_brewery"];

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
  /* Using a fetch and prmoise to send data */
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
  /* Not using a fetch and prmoise as we want this to be async and store the date */
  async getBeerResults()
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
    const response = await fetch("https://17yiu3g03f.execute-api.us-east-1.amazonaws.com/BeerMenuGet", requestOptions)
    const data = await response.json();
    this.state.beerResults = String(data.body).replace(/["]/g, "");
    // console.log(this.state.beerResults);

    /* Parse the dirty dirty data...wish it was in JSON */
    var beginIdx = 0; var endIdx = 0;
    if (data.statusCode == 200)
    {
      for (let i = 0; i < this.infoDictMap.length - 1; i++)
      {
        // Get beginning of string index
        beginIdx = this.state.beerResults.indexOf(this.infoDictMap[i]) + this.infoDictMap[i].length + 2;

        // Get end of string index
        if (i == this.infoDictMap.length - 1)
          endIdx = this.state.beerResults.length - 2;
        else
          endIdx = this.state.beerResults.indexOf(this.infoDictMap[i+1]) - 2;

        // Split the string into an array
        this.infoDict[i] = this.state.beerResults.slice(beginIdx, endIdx).split(',');

        // Delete the first two characters in each array
        for (let j = 0; j < this.infoDict[i].length; j++)
          this.infoDict[i][j] = this.infoDict[i][j].slice(2);

        // Set input string to remaining string to be analyzed
        this.state.beerResults = this.state.beerResults.slice(endIdx);
      }
    }
    console.log(this.infoDict);
  }

  /* Handles the get beer results click, needed to have an async function */
  handleBeerResultsClick = (e) =>
  {
    e.preventDefault();
    this.getBeerResults();
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
          <Button onClick={this.handleBeerResultsClick}>Get Results!</Button>
        </div> 
      </div>
    );
  }
}

export default App;

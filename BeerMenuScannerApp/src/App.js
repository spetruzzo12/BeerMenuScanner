import React from 'react';
import { Heading } from '@aws-amplify/ui-react';
import { Table, Form, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
// import '@aws-amplify/ui-react/styles.css';

class App extends React.Component 
{
  constructor(props)
  {
    super(props);
    this.state = { showResults: false, loading: false, noImageError: false };
  }
  
  selectedImage = null; base64 = ""; beerResults = "";
  infoDict = {"old_names": "", "correct_ratio": "", "idx": "", "Name": "", "Style": "", "ABV": "", "Ratings": "", "AVG": "", "Last Active": "", "brewery": "", "brewery_link": "", "beer_link": "", "beer_brewery": ""};
  infoDictMap = ["old_names", "correct_ratio", "idx", "Name", "Style", "ABV", "Ratings", "Avg", "Last Active", "brewery", "brewery_link", "beer_link", "beer_brewery"];

  /* Get the selected image and properties */
  fileSelectedHandler = async (e) =>
  {
    this.selectedImage = e.target.files[0];
    console.log(this.selectedImage.name);

    this.base64 = await this.readFile(this.selectedImage);
    this.base64 = this.base64.replace("data:", "").replace(/^.+,/, "");
    // console.log(this.base64);
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
    if (!this.selectedImage)
    {
      this.setState({ noImageError: true });
      return;
    }
    this.setState({ showResults: false, noImageError: false });

    /* Send to Lambda function from here */
    /* Format our REST POST */
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({"ImageName": this.selectedImage.name, "Base64": this.base64});
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
    if (!this.selectedImage)
    {
      this.setState({ noImageError: true });
      return;
    }
    this.setState({ loading: true, showResults: false, noImageError: false });

    /* Call API to check for results if they exist */
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({"Key": this.selectedImage.name.slice(0, this.selectedImage.name.indexOf(".")) + ".json"});
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    /* Execute the POST */
    const response = await fetch("https://17yiu3g03f.execute-api.us-east-1.amazonaws.com/BeerMenuGet", requestOptions)
    const data = await response.json();
    this.beerResults = String(data.body).replace(/["]/g, "");
    // console.log(this.beerResults);

    /* Parse the dirty dirty data...wish it was in JSON */
    var beginIdx = 0; var endIdx = 0;
    if (data.statusCode == 200)
    {
      for (let i = 0; i < this.infoDictMap.length - 1; i++)
      {
        // Get beginning of string index
        beginIdx = this.beerResults.indexOf(this.infoDictMap[i]) + this.infoDictMap[i].length + 2;

        // Get end of string index
        if (i == this.infoDictMap.length - 1)
          endIdx = this.beerResults.length - 2;
        else
          endIdx = this.beerResults.indexOf(this.infoDictMap[i+1]) - 2;

        // Split the string into an array
        this.infoDict[i] = this.beerResults.slice(beginIdx, endIdx).split(',');

        // Delete the first two characters in each array
        for (let j = 0; j < this.infoDict[i].length; j++)
        {
          this.infoDict[i][j] = this.infoDict[i][j].slice(2);
          if (this.infoDictMap[i] == "ABV")
            this.infoDict[i][j] = this.infoDict[i][j] + "%";
        }

        // Set input string to remaining string to be analyzed
        this.beerResults = this.beerResults.slice(endIdx);
        this.setState({ loading: false, showResults: true });
      }
      console.log(this.infoDict);
    }
    else
      console.log("No results to display yet.");
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
          <Heading level={1} style={{marginTop: '24px'}}>BEER MENU SCANNER</Heading>
          <Heading level={6} style={{marginTop: '16px'}}>Choose your beer image to be scanned, then uploaded!</Heading>
          <Container>
            <Row>
              <Col></Col>
              <Col>
              <Form.Group controlId="formFile" className="mb-3" style={{marginTop: '24px'}}>
                <Form.Control type="file" onChange={this.fileSelectedHandler}/>
              </Form.Group>
              </Col>
              <Col md={1}>
              <Button style={{marginTop: '1.5rem'}} onClick={this.uploadImage}>Upload</Button><br></br>
              </Col>
              <Col></Col>
            </Row>
          </Container>
          <Button style={{marginTop: '16px'}} onClick={this.handleBeerResultsClick}>Get Results!</Button>
          {this.state.showResults && <Container style={{marginTop: '24px'}}>
            <Row>
              <Col></Col>
              <Col md={10}>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Beer</th>
                    <th>Brewery</th>
                    <th>ABV</th>
                    <th>Rating</th>
                    <th>Style</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{this.infoDict[3][0]}</td>
                    <td>{this.infoDict[9][0]}</td>
                    <td>{this.infoDict[5][0]}</td>
                    <td>{this.infoDict[7][0]}</td>
                    <td>{this.infoDict[4][0]}</td>
                  </tr>
                  <tr>
                    <td>{this.infoDict[3][1]}</td>
                    <td>{this.infoDict[9][1]}</td>
                    <td>{this.infoDict[5][1]}</td>
                    <td>{this.infoDict[7][1]}</td>
                    <td>{this.infoDict[4][1]}</td>
                  </tr>
                  <tr>
                    <td>{this.infoDict[3][2]}</td>
                    <td>{this.infoDict[9][2]}</td>
                    <td>{this.infoDict[5][2]}</td>
                    <td>{this.infoDict[7][2]}</td>
                    <td>{this.infoDict[4][2]}</td>
                  </tr>
                  <tr>
                    <td>{this.infoDict[3][3]}</td>
                    <td>{this.infoDict[9][3]}</td>
                    <td>{this.infoDict[5][3]}</td>
                    <td>{this.infoDict[7][3]}</td>
                    <td>{this.infoDict[4][3]}</td>
                  </tr>
                  <tr>
                    <td>{this.infoDict[3][4]}</td>
                    <td>{this.infoDict[9][4]}</td>
                    <td>{this.infoDict[5][4]}</td>
                    <td>{this.infoDict[7][4]}</td>
                    <td>{this.infoDict[4][4]}</td>
                  </tr>
                </tbody>
              </Table>
              </Col>
              <Col></Col>
            </Row>
          </Container>}
          {this.state.loading && <div style={{marginTop: '5rem'}}>
            <Spinner animation="grow"/>
            <Heading level={6} style={{marginTop: '10px'}}>Just a moment. Finding your beer results! This may take up to 3 minutes...</Heading>
            <Heading level={6}>Please periodically click the "Get Results!" button.</Heading>
          </div>}
          {this.state.noImageError && <div style={{marginTop: '3rem', color: 'red'}}>
            <Heading level={4} style={{marginTop: '10px'}}>No beer image selected. Please first select an image and upload.</Heading>
          </div>}
        </div> 
      </div>
    );
  }
}

export default App;

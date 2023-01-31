/* New main file for the Beer Menu Scanner. From here you can upload an image and view the Scanner results. */

import { Amplify } from 'aws-amplify';
import awsExports from '../aws-exports';
import { Heading } from '@aws-amplify/ui-react';

Amplify.configure(awsExports);

const Main = () => {
    return (
        <div style={{padding:"16px"}} id="about">
        <Heading style = {{textAlign: "center"}} level={1}>BEER MENUE SCANNER</Heading>
        </div> 
    )
}

export default Main
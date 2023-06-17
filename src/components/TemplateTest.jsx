import React, { Component } from 'react';
import PropTypes from "prop-types";
import axios from "axios";
import { Button } from '@mui/material';
import { Buffer } from 'buffer';

class TemplateTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      templateContent: '',
      jsonData: '',
      compileToPDF: false,
      compiledResult: '',
      isLoading: false,
    };
  }

  handleTemplateChange = (event) => {
    this.setState({ templateContent: event.target.value });
  };

  handleJsonDataChange = (event) => {
    this.setState({ jsonData: event.target.value });
  };

  handleCompileToPDFChange = (event) => {
    this.setState({ compileToPDF: event.target.checked });
  };

  handleCompileButtonClick = async () => {
    const { templateContent, jsonData, compileToPDF } = this.state;

    this.setState({ isLoading: true });

    const requestBody = {
      template: {
        content: templateContent,
        engine: 'handlebars',
        helpers:
          "const handlebars = require('handlebars'); require('handlebars-helpers')({ handlebars });",
        recipe: compileToPDF ? 'phantom-pdf' : 'html',
        ...(compileToPDF && {
          phantom: {
            format: 'A4',
            margin: { bottom: '20mm', left: '30mm', right: '10mm', top: '20mm' },
            orientation: 'portrait',
            waitForJS: true,
          },
        }),
      },
      data: JSON.parse(jsonData),
    };

    await axios.post('INSERT_LINK_TO_YOUR_JSREPORT_SERVICE', requestBody).then(resp => {
      console.log('resp', resp)
      console.log('resp.config.data', resp.data?.content?.data)
      try {
        const buffer = new Uint8Array(resp.data?.content?.data);
        const decoder = new TextDecoder('utf-8');
        const html = decoder.decode(buffer);
        if (this.state.compileToPDF === true) {
          const base64Data = resp.data?.content?.data;
          const buffer = Buffer.from(base64Data, 'base64');
          const decodedData = buffer.toString('utf-8');
          console.log(decodedData); // Decoded data in UTF-8

          this.setState({ compiledResult: decodedData });
        }
        console.log(html); // <h1>Hello</h1>

        this.setState({ compiledResult: html });
      } catch (err) {
        alert('err', err)
      }
    });

    this.setState({ isLoading: false })
  };

  render() {
    const { templateContent, jsonData, compileToPDF, compiledResult, isLoading } = this.state;
    return (
      <div>
        <div style={{ display: 'flex', height: '100vh', marginLeft: '5px' }}>
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
            <textarea
              placeholder="Template Content"
              value={templateContent}
              onChange={this.handleTemplateChange}
              style={{ flex: '1' }}
            ></textarea>
            <textarea
              placeholder="JSON Data"
              value={jsonData}
              onChange={this.handleJsonDataChange}
              style={{ flex: '1', marginTop: '5px' }}
            ></textarea>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                style={{ color: "white", backgroundColor: 'green', margin: '10px 10px 10px 10px', padding: '10px 10px 10px 10px' }}
                onClick={this.handleCompileButtonClick} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Compile'}
              </Button>
              <label>
                <input
                  type="checkbox"
                  checked={compileToPDF}
                  onChange={this.handleCompileToPDFChange}
                />
                Compile to PDF
              </label>
            </div>
          </div>
          <div style={{ flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {compiledResult ? (
              compileToPDF ? (
                <iframe
                  title="Compiled Result"
                  srcDoc={`data:application/pdf;base64,${compiledResult}`}
                  style={{ width: '100%', height: '100%' }}
                ></iframe>
              ) : (
                <iframe
                  title="Compiled Result"
                  srcDoc={`${compiledResult}`}
                  style={{ width: '100%', height: '100%' }}
                ></iframe>
              )
            ) : (
              <div>No compiled result yet.</div>
            )}
          </div>
        </div>
        <span style={{ textAlign: 'center' }}>by Vladyslav Kormachenko</span>
      </div >
    );
  }
}

TemplateTest.propTypes = {
  handlePressBtn: PropTypes.func.isRequired
};

export default TemplateTest;

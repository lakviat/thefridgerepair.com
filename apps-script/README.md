# Google Apps Script Starter

1. Create a new Apps Script project.
2. Paste in the contents of `lead-handler.gs`.
3. Deploy it as a web app.
4. Set access to allow incoming requests as needed for your workflow.
5. Copy the deployed web app URL.
6. Add that URL to the `data-endpoint` attribute on the form in `index.html`.

## Current Email Target

`tvmount360@gmail.com`

## Notes

- The frontend is prepared to `POST` standard form-encoded data to the Apps Script URL.
- Once you deploy the script, we can replace the temporary local-success behavior with the live endpoint in under a minute.

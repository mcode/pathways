// IMPORTANT: anything with /g is stateful, meaning these could fail in weird ways
// if they use the /g global flag
// we should review these

// sample header= "multipart/form-data;boundary=Boundary_1"
// get the part after "boundary=" and before any subsequent ;
export const extractMultipartBoundary = /.*;boundary=(Boundary.*);?.*/;

export const extractMultipartFileName = /Content-Disposition: form-data; name="([^"]+)"/;

// eveything between { } including newlines. [^] is like . but matches newline
export const extractJSONContent = /(\{[^]*\})/;

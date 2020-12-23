��    R      �  m   <      �  �   �  U   �  �   "  W   �  z   	  �   �	  e   L
  v   �
  �   )  I   �  �   C  �   �  �   X  �   '  �     �     t   �  �     �   �  �   �  �   �  �   l  �   e  /    �   2  �  �  *  �  �   �  `   �          
  !     {   1     �  0   �     �     �          4  "   S     v     �     �     �     �          &     D     R     a     o     �     �     �     �  %   �     �     �     �  .   �     (  $   6  .   [  $   �     �  &   �      �     �              %   '   D   M      �      �      �   
   �      �   �   �   E   n!     �!     �!  �  �!  �   [#  U   6$  �   �$  W   0%  z   �%  �   &  e   �&  v   '  �   �'  I   c(  �   �(  �   @)  �   �)  �   �*  �   �+  �   x,  t   �,  �   o-  �   J.  �   ;/  �   :0  �   �0  �   �1  /  l2  �   �3  �  54  *  /6  �   Z7  `   8     n8     t8  !   y8  {   �8     9  0   $9     U9     e9     �9     �9  "   �9     �9     �9     :     =:     S:     q:     �:     �:     �:     �:     �:     �:     �:     ;     ;  %   ;     D;     U;     Z;  .   c;     �;  $   �;  .   �;  $   �;     <  &   <      D<     e<     l<     z<  %   �<  D   �<     �<     =     =  
   /=     :=  �   L=  E   �=     >     $>     ,      	                  9       &      5   )       /         N   2   7      F   H                 :   I   .      "         <   P   @   (   R                         K   =                       C       0   L       -   $          ;   G                  >       
   D      *   '   +      B   4      !       J   8           ?               1            Q   A   %          6   M      O   E       3      #     - 400 Bad Request. Server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).  - 401 Unauthorized. Request was not sent with the proper authentication credentials.  - 403 Forbidden. This is generally related to permission rules on your server. Contact the system administrator for more information regarding this error message.  - 404 Not Found. Origin server was unable or unwilling to find the resource requested.  - 405 Method Not Allowed. Origin server is aware of the requested resource, but the request method used is not supported.  - 406 Not Acceptable. Resource is not available at the origin that adheres to negotiation headers that were  set prior (e.g. via 'Accept-Charset' and 'Accept-Language' headers).  - 407 Authentication Required. The client did not send the required authentication with the request.  - 408 Request Timeout. The origin server did not receive the complete request in what it considers a reasonable time.  - 409 Conflict. The request did not complete because of a conflict with the current state of the resource. Typically happens on a PUT request where multiple clients are attempting to edit the same resource.  - 410 Gone. The resource requested is permanently missing at the origin.  - 411 Length Required. Client did not define the 'Content-Length' of the request body in the headers and this is required to obtain the resource.  - 412 Precondition Failed. Server denies the request because the resource failed to meet the conditions specified by the client.  - 413 Payload Too Large. Refusal from the server to process the request because the payload sent from the client is larger than the server wished to accept. Server has the optional to close the connection.  - 414 URI Too Long. Refusal from the server that the URI was too long to be processed. For example, if a client is attempting a GET request with an unusually long URI after a POST, this could be seen as a security risk and a 414 gets generated.  - 415 Unsupported Media Type. Refusal from the server to process the format of the current payload. One way to identify and fix this issue would be to look at the 'Content-Type' or 'Content-Encoding' headers sent in the client’s request.  - 417 Expectation Failed. Failure of server to meet the requirements specified in the 'Expect' header of the client’s request.  - 429 Too Many Requests. Client has sent too many requests in the specified amount of time according to the server.  - 499 Client Close Request. Nginx specific response code to indicate when the connection has been closed by the client while the server is still processing its request, making server unable to send a status code back.  - 500 Internal Server Error. This error indicates that the server has encountered an unexpected condition. This often occurs when an application request cannot be fulfilled due to the application being configured incorrectly on the server.  - 501 Not Implemented. This error indicates that the HTTP method sent by the client is not supported by the server. This is most often caused by the server being out of date. It is a very rare error and generally requires that the web server be updated.  - 502 Bad Gateway. This error is usually due to improperly configured proxy servers. The first step in resolving the issue is to clear the client's cache.  - 503 Service Unavailable. This error occurs when the server is unable to handle requests due to a temporary overload or due to the server being temporarily closed for maintenance. The error indicates that the server will only temporarily be down.  - 504 Gateway Timeout. GeoNode lost the connection with GeoServer or DB due to a connection timeout. Consider using the management commands to import data!  - 505 HTTP Version Not Supported. This error occurs when the server refuses to support the HTTP protocol that has been specified by the client computer. This can be caused by the protocol not being specified properly by the client computer; for example, if an invalid version number has been specified.  - 506 Variant Also Negotiates. This error indicates that the server is not properly configured. Contact the system administrator to resolve this issue.  - 507 Insufficient Storage. This error indicates that the server is out of free memory. This is most likely to occur when an application that is being requested cannot allocate the necessary system resources to run. To resolve the issue, the server's hard disk may need to be cleaned of any unnecessary documents to free up more hard disk space, its memory may need to be expanded, or it may simply need to be restarted. Contact the system administrator for more information regarding this error message.  - 509 Bandwidth Limit Exceeded. This error occurs when the bandwidth limit imposed by the system administrator has been reached. The only fix for this issue is to wait until the limit is reset in the following cycle. Consult the system administrator for information about acquiring more bandwidth.  - 510 Not Extended. This error occurs when an extension attached to the HTTP request is not supported by the web server. To resolve the issue, you may need to update the server.  Error Code. Contact the system administrator for more information regarding this error message.  Info <br> <br>Bad request or URL not found. <br>Please check your network connection. In case of Layer Upload make sure GeoServer is running and accepting connections. <br>Unknown. A temporal dimension may be added to this Layer. ASCII Text File CADRG-Global Navigation Chart CADRG-Jet Navigation Chart CADRG-Joint Operations Graphic CADRG-Operational Navigation Chart CADRG-Tactical Pilotage Chart CADRG-Topographic Line Map 100K CADRG-Topographic Line Map 50K Comma Separated Value Controlled Image Base-1 Meter Controlled Image Base-10 Meter Controlled Image Base-5 Meter ERDAS Imagine ESRI Shapefile Edit Metadata Files are ready to be ingested! GIF GeoJSON GeoTIFF Google Earth KML Google Earth KML with a GroundOverlay Google Earth KMZ JPEG JPEG2000 Layer files uploaded, configuring in GeoServer Manage Styles Missing a %s file, which is required MrSID-Multi-resolution Seamless Image Database National Imagery Transmission Format PNG Performing Final GeoServer Config Step Performing GeoServer Config Step Remove STORE_UPDATED Style Layer Descriptor The column %1 was renamed to %2 <br/> The file %s is an unsupported file type, please select another file. Unexpected Error Unexpected error! Upload Metadata Upload SLD XML Metadata File You are trying to upload an incomplete set of files or not all mandatory options have been validated.

Please check for errors in the form! You need to specify more information in order to complete your upload Your  Zip Archive Project-Id-Version: GeoNode
Report-Msgid-Bugs-To: 
PO-Revision-Date: 2020-11-28 19:14+0100
Last-Translator: Julien Collaer <julien.collaer@opengeode.be>
Language-Team: English (http://www.transifex.com/geonode/geonode/language/en/)
Language: en
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Plural-Forms: nplurals=2; plural=(n != 1);
X-Generator: Poedit 2.4.2
  - 400 Bad Request. Server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).  - 401 Unauthorized. Request was not sent with the proper authentication credentials.  - 403 Forbidden. This is generally related to permission rules on your server. Contact the system administrator for more information regarding this error message.  - 404 Not Found. Origin server was unable or unwilling to find the resource requested.  - 405 Method Not Allowed. Origin server is aware of the requested resource, but the request method used is not supported.  - 406 Not Acceptable. Resource is not available at the origin that adheres to negotiation headers that were  set prior (e.g. via 'Accept-Charset' and 'Accept-Language' headers).  - 407 Authentication Required. The client did not send the required authentication with the request.  - 408 Request Timeout. The origin server did not receive the complete request in what it considers a reasonable time.  - 409 Conflict. The request did not complete because of a conflict with the current state of the resource. Typically happens on a PUT request where multiple clients are attempting to edit the same resource.  - 410 Gone. The resource requested is permanently missing at the origin.  - 411 Length Required. Client did not define the 'Content-Length' of the request body in the headers and this is required to obtain the resource.  - 412 Precondition Failed. Server denies the request because the resource failed to meet the conditions specified by the client.  - 413 Payload Too Large. Refusal from the server to process the request because the payload sent from the client is larger than the server wished to accept. Server has the optional to close the connection.  - 414 URI Too Long. Refusal from the server that the URI was too long to be processed. For example, if a client is attempting a GET request with an unusually long URI after a POST, this could be seen as a security risk and a 414 gets generated.  - 415 Unsupported Media Type. Refusal from the server to process the format of the current payload. One way to identify and fix this issue would be to look at the 'Content-Type' or 'Content-Encoding' headers sent in the client’s request.  - 417 Expectation Failed. Failure of server to meet the requirements specified in the 'Expect' header of the client’s request.  - 429 Too Many Requests. Client has sent too many requests in the specified amount of time according to the server.  - 499 Client Close Request. Nginx specific response code to indicate when the connection has been closed by the client while the server is still processing its request, making server unable to send a status code back.  - 500 Internal Server Error. This error indicates that the server has encountered an unexpected condition. This often occurs when an application request cannot be fulfilled due to the application being configured incorrectly on the server.  - 501 Not Implemented. This error indicates that the HTTP method sent by the client is not supported by the server. This is most often caused by the server being out of date. It is a very rare error and generally requires that the web server be updated.  - 502 Bad Gateway. This error is usually due to improperly configured proxy servers. The first step in resolving the issue is to clear the client's cache.  - 503 Service Unavailable. This error occurs when the server is unable to handle requests due to a temporary overload or due to the server being temporarily closed for maintenance. The error indicates that the server will only temporarily be down.  - 504 Gateway Timeout. GeoNode lost the connection with GeoServer or DB due to a connection timeout. Consider using the management commands to import data!  - 505 HTTP Version Not Supported. This error occurs when the server refuses to support the HTTP protocol that has been specified by the client computer. This can be caused by the protocol not being specified properly by the client computer; for example, if an invalid version number has been specified.  - 506 Variant Also Negotiates. This error indicates that the server is not properly configured. Contact the system administrator to resolve this issue.  - 507 Insufficient Storage. This error indicates that the server is out of free memory. This is most likely to occur when an application that is being requested cannot allocate the necessary system resources to run. To resolve the issue, the server's hard disk may need to be cleaned of any unnecessary documents to free up more hard disk space, its memory may need to be expanded, or it may simply need to be restarted. Contact the system administrator for more information regarding this error message.  - 509 Bandwidth Limit Exceeded. This error occurs when the bandwidth limit imposed by the system administrator has been reached. The only fix for this issue is to wait until the limit is reset in the following cycle. Consult the system administrator for information about acquiring more bandwidth.  - 510 Not Extended. This error occurs when an extension attached to the HTTP request is not supported by the web server. To resolve the issue, you may need to update the server.  Error Code. Contact the system administrator for more information regarding this error message.  Info <br> <br>Bad request or URL not found. <br>Please check your network connection. In case of Layer Upload make sure GeoServer is running and accepting connections. <br>Unknown. A temporal dimension may be added to this Layer. ASCII Text File CADRG-Global Navigation Chart CADRG-Jet Navigation Chart CADRG-Joint Operations Graphic CADRG-Operational Navigation Chart CADRG-Tactical Pilotage Chart CADRG-Topographic Line Map 100K CADRG-Topographic Line Map 50K Comma Separated Value Controlled Image Base-1 Meter Controlled Image Base-10 Meter Controlled Image Base-5 Meter ERDAS Imagine ESRI Shapefile Edit Metadata Files are ready to be ingested! GIF GeoJSON GeoTIFF Google Earth KML Google Earth KML with a GroundOverlay Google Earth KMZ JPEG JPEG2000 Layer files uploaded, configuring in GeoServer Manage Styles Missing a %s file, which is required MrSID-Multi-resolution Seamless Image Database National Imagery Transmission Format PNG Performing Final GeoServer Config Step Performing GeoServer Config Step Remove STORE_UPDATED Style Layer Descriptor The column %1 was renamed to %2 <br/> The file %s is an unsupported file type, please select another file. Unexpected Error Unexpected error! Upload Metadata Upload SLD XML Metadata File You are trying to upload an incomplete set of files or not all mandatory options have been validated.

Please check for errors in the form! You need to specify more information in order to complete your upload Your  Zip Archive 
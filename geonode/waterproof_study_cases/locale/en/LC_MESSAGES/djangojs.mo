��    �      �  �   |	      �  �   �  U   �  �   �  W   �  z   �  �   q  e   $  v   �  �     I   �  �     �   �  �   0  �   �  �   �  �   �  t   h  �   �  �   �  �   �  �   �  �   D  �   =  /  �  �   
  �  �  *  �  �   �   `   {!     �!     �!  !   �!  {   	"     �"  0   �"     �"     �"     �"     �"     #     6#  "   U#     x#     �#     �#     �#     �#     �#     $     4$     R$     `$     o$     }$     �$     �$     �$     �$  %   �$     �$     �$     %     %  .   %     K%  $   Y%  .   ~%  $   �%     �%  &   �%      �%     &     %&     3&  %   J&  D   p&     �&     �&     �&  
   �&     �&  �   '  E   �'     �'     �'     �'     �'     �'     (     (     (     (     (     #(  
   ((  
   3(  
   >(     I(     U(     d(     i(     o(     u(     �(     �(     �(     �(  
   �(     �(     �(     �(     	)     )     #)     ()     .)     4)     :)     ?)     D)     I)     N)     S)     X)     ])     b)     i)     p)     w)     �)     �)     �)  
   �)     �)     �)     �)     �)     �)     �)      *  
   *  
   *     &*     A*     I*     Q*     b*     n*     u*  i  |*  �   �+  U   �,  �   -  W   �-  z   .  �   �.  e   A/  v   �/  �   0  I   �0  �   81  �   �1  �   M2  �   3  �   4  �   5  t   �5  �   �5  �   �6  �   �7  �   �8  �   a9  �   Z:  /  �:  �   '<  �  �<  *  �>  �   �?  `   �@     �@     �@  !   A  {   &A     �A  0   �A     �A  1  �A  �   "C     �C     �C     �C  "   D     /D     MD     mD     �D     �D     �D     �D     �D     	E     E     &E     4E     TE     XE     `E     hE  %   yE     �E  #   �E     �E     �E  .   �E     F  $   F  .   DF  $   sF     �F  &   �F      �F     �F     �F     �F  %   G  D   6G     {G     �G     �G  
   �G     �G  �   �G  E   WH     �H     �H     �H     �H     �H     �H     �H     �H     I     %I     :I     OI     jI     yI     �I     �I     �I     �I     �I  �   �I     ]J  (   sJ     �J  �   �J     DK  C   [K  c   �K     L     L     L     +L     @L     VL     lL     �L     �L     �L     �L     �L     �L      M     M     *M     >M     RM     iM     �M     �M     �M     �M     �M     �M     �M     N  '   #N  !   KN     mN     }N     �N  �   �N     �O     �O     �O  �   �O     uP     �P     ;   8       Y   �   I       $           a      b   C          k   �   }   �           c       1                 ?   �       O   �   j   4       %   �   [   r       Q                 Z   d   ,                  <   *   9      |   B                     F   G   �       o   m           .   �   (   �      !      J   P                  W   v      �   p   K   w   h      M                   �      A       l       ~   =   �           0   R   2       6   �   )       �   X               �          3   �       T   #               ^   
   >       U   s   \   x   y   z   {   /      -   H       	   �           E      N   �   V       q          D   &   i           L   `   �          "       :       f   '   g      S              �   u           +   5   @   t   7         n      ]      _   �      e   �   �                - 400 Bad Request. Server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).  - 401 Unauthorized. Request was not sent with the proper authentication credentials.  - 403 Forbidden. This is generally related to permission rules on your server. Contact the system administrator for more information regarding this error message.  - 404 Not Found. Origin server was unable or unwilling to find the resource requested.  - 405 Method Not Allowed. Origin server is aware of the requested resource, but the request method used is not supported.  - 406 Not Acceptable. Resource is not available at the origin that adheres to negotiation headers that were  set prior (e.g. via 'Accept-Charset' and 'Accept-Language' headers).  - 407 Authentication Required. The client did not send the required authentication with the request.  - 408 Request Timeout. The origin server did not receive the complete request in what it considers a reasonable time.  - 409 Conflict. The request did not complete because of a conflict with the current state of the resource. Typically happens on a PUT request where multiple clients are attempting to edit the same resource.  - 410 Gone. The resource requested is permanently missing at the origin.  - 411 Length Required. Client did not define the 'Content-Length' of the request body in the headers and this is required to obtain the resource.  - 412 Precondition Failed. Server denies the request because the resource failed to meet the conditions specified by the client.  - 413 Payload Too Large. Refusal from the server to process the request because the payload sent from the client is larger than the server wished to accept. Server has the optional to close the connection.  - 414 URI Too Long. Refusal from the server that the URI was too long to be processed. For example, if a client is attempting a GET request with an unusually long URI after a POST, this could be seen as a security risk and a 414 gets generated.  - 415 Unsupported Media Type. Refusal from the server to process the format of the current payload. One way to identify and fix this issue would be to look at the 'Content-Type' or 'Content-Encoding' headers sent in the client’s request.  - 417 Expectation Failed. Failure of server to meet the requirements specified in the 'Expect' header of the client’s request.  - 429 Too Many Requests. Client has sent too many requests in the specified amount of time according to the server.  - 499 Client Close Request. Nginx specific response code to indicate when the connection has been closed by the client while the server is still processing its request, making server unable to send a status code back.  - 500 Internal Server Error. This error indicates that the server has encountered an unexpected condition. This often occurs when an application request cannot be fulfilled due to the application being configured incorrectly on the server.  - 501 Not Implemented. This error indicates that the HTTP method sent by the client is not supported by the server. This is most often caused by the server being out of date. It is a very rare error and generally requires that the web server be updated.  - 502 Bad Gateway. This error is usually due to improperly configured proxy servers. The first step in resolving the issue is to clear the client's cache.  - 503 Service Unavailable. This error occurs when the server is unable to handle requests due to a temporary overload or due to the server being temporarily closed for maintenance. The error indicates that the server will only temporarily be down.  - 504 Gateway Timeout. GeoNode lost the connection with GeoServer or DB due to a connection timeout. Consider using the management commands to import data!  - 505 HTTP Version Not Supported. This error occurs when the server refuses to support the HTTP protocol that has been specified by the client computer. This can be caused by the protocol not being specified properly by the client computer; for example, if an invalid version number has been specified.  - 506 Variant Also Negotiates. This error indicates that the server is not properly configured. Contact the system administrator to resolve this issue.  - 507 Insufficient Storage. This error indicates that the server is out of free memory. This is most likely to occur when an application that is being requested cannot allocate the necessary system resources to run. To resolve the issue, the server's hard disk may need to be cleaned of any unnecessary documents to free up more hard disk space, its memory may need to be expanded, or it may simply need to be restarted. Contact the system administrator for more information regarding this error message.  - 509 Bandwidth Limit Exceeded. This error occurs when the bandwidth limit imposed by the system administrator has been reached. The only fix for this issue is to wait until the limit is reset in the following cycle. Consult the system administrator for information about acquiring more bandwidth.  - 510 Not Extended. This error occurs when an extension attached to the HTTP request is not supported by the web server. To resolve the issue, you may need to update the server.  Error Code. Contact the system administrator for more information regarding this error message.  Info <br> <br>Bad request or URL not found. <br>Please check your network connection. In case of Layer Upload make sure GeoServer is running and accepting connections. <br>Unknown. A temporal dimension may be added to this Layer. ASCII Text File Alert_time_demand Alert_time_demand_title CADRG-Global Navigation Chart CADRG-Jet Navigation Chart CADRG-Joint Operations Graphic CADRG-Operational Navigation Chart CADRG-Tactical Pilotage Chart CADRG-Topographic Line Map 100K CADRG-Topographic Line Map 50K CO2_country Comma Separated Value Controlled Image Base-1 Meter Controlled Image Base-10 Meter Controlled Image Base-5 Meter ERDAS Imagine ESRI Shapefile Edit Metadata Files are ready to be ingested! GIF GeoJSON GeoTIFF Google Earth KML Google Earth KML with a GroundOverlay Google Earth KMZ InVEST_documentation JPEG JPEG2000 Layer files uploaded, configuring in GeoServer Manage Styles Missing a %s file, which is required MrSID-Multi-resolution Seamless Image Database National Imagery Transmission Format PNG Performing Final GeoServer Config Step Performing GeoServer Config Step Remove STORE_UPDATED Style Layer Descriptor The column %1 was renamed to %2 <br/> The file %s is an unsupported file type, please select another file. Unexpected Error Unexpected error! Upload Metadata Upload SLD XML Metadata File You are trying to upload an incomplete set of files or not all mandatory options have been validated.

Please check for errors in the form! You need to specify more information in order to complete your upload Your  Zip Archive are_you_sure c_above c_below c_dead c_soil cn_a cn_b cn_c cn_d cover_rank crit_len_n crit_len_p description discount_value edit eff_n eff_p error_annual_investment error_discount error_fields error_minimum error_minimun_nbs error_name error_period_analysis error_period_nbs exchange_rate field_empty field_problem kc_1 kc_10 kc_11 kc_12 kc_2 kc_3 kc_4 kc_5 kc_6 kc_7 kc_8 kc_9 load_n load_p lucode lulc_veg minimum_value n_exp n_ret native_veg p_exp p_ret portfolios intro portfolios objectives proportion_subsurface_n question_revert response_delete root_depth rough_rank run_processing_description sed_exp sed_ret study_case_exist tables_text usle_c usle_p Project-Id-Version: Waterproof V1
Report-Msgid-Bugs-To: 
PO-Revision-Date: 2021-11-26 11:19-0500
Last-Translator: Julien Collaer <julien.collaer@opengeode.be>
Language-Team: English Skaphe
Language: en
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Plural-Forms: nplurals=2; plural=(n != 1);
X-Generator: Poedit 2.4.3
  - 400 Bad Request. Server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).  - 401 Unauthorized. Request was not sent with the proper authentication credentials.  - 403 Forbidden. This is generally related to permission rules on your server. Contact the system administrator for more information regarding this error message.  - 404 Not Found. Origin server was unable or unwilling to find the resource requested.  - 405 Method Not Allowed. Origin server is aware of the requested resource, but the request method used is not supported.  - 406 Not Acceptable. Resource is not available at the origin that adheres to negotiation headers that were  set prior (e.g. via 'Accept-Charset' and 'Accept-Language' headers).  - 407 Authentication Required. The client did not send the required authentication with the request.  - 408 Request Timeout. The origin server did not receive the complete request in what it considers a reasonable time.  - 409 Conflict. The request did not complete because of a conflict with the current state of the resource. Typically happens on a PUT request where multiple clients are attempting to edit the same resource.  - 410 Gone. The resource requested is permanently missing at the origin.  - 411 Length Required. Client did not define the 'Content-Length' of the request body in the headers and this is required to obtain the resource.  - 412 Precondition Failed. Server denies the request because the resource failed to meet the conditions specified by the client.  - 413 Payload Too Large. Refusal from the server to process the request because the payload sent from the client is larger than the server wished to accept. Server has the optional to close the connection.  - 414 URI Too Long. Refusal from the server that the URI was too long to be processed. For example, if a client is attempting a GET request with an unusually long URI after a POST, this could be seen as a security risk and a 414 gets generated.  - 415 Unsupported Media Type. Refusal from the server to process the format of the current payload. One way to identify and fix this issue would be to look at the 'Content-Type' or 'Content-Encoding' headers sent in the client’s request.  - 417 Expectation Failed. Failure of server to meet the requirements specified in the 'Expect' header of the client’s request.  - 429 Too Many Requests. Client has sent too many requests in the specified amount of time according to the server.  - 499 Client Close Request. Nginx specific response code to indicate when the connection has been closed by the client while the server is still processing its request, making server unable to send a status code back.  - 500 Internal Server Error. This error indicates that the server has encountered an unexpected condition. This often occurs when an application request cannot be fulfilled due to the application being configured incorrectly on the server.  - 501 Not Implemented. This error indicates that the HTTP method sent by the client is not supported by the server. This is most often caused by the server being out of date. It is a very rare error and generally requires that the web server be updated.  - 502 Bad Gateway. This error is usually due to improperly configured proxy servers. The first step in resolving the issue is to clear the client's cache.  - 503 Service Unavailable. This error occurs when the server is unable to handle requests due to a temporary overload or due to the server being temporarily closed for maintenance. The error indicates that the server will only temporarily be down.  - 504 Gateway Timeout. GeoNode lost the connection with GeoServer or DB due to a connection timeout. Consider using the management commands to import data!  - 505 HTTP Version Not Supported. This error occurs when the server refuses to support the HTTP protocol that has been specified by the client computer. This can be caused by the protocol not being specified properly by the client computer; for example, if an invalid version number has been specified.  - 506 Variant Also Negotiates. This error indicates that the server is not properly configured. Contact the system administrator to resolve this issue.  - 507 Insufficient Storage. This error indicates that the server is out of free memory. This is most likely to occur when an application that is being requested cannot allocate the necessary system resources to run. To resolve the issue, the server's hard disk may need to be cleaned of any unnecessary documents to free up more hard disk space, its memory may need to be expanded, or it may simply need to be restarted. Contact the system administrator for more information regarding this error message.  - 509 Bandwidth Limit Exceeded. This error occurs when the bandwidth limit imposed by the system administrator has been reached. The only fix for this issue is to wait until the limit is reset in the following cycle. Consult the system administrator for information about acquiring more bandwidth.  - 510 Not Extended. This error occurs when an extension attached to the HTTP request is not supported by the web server. To resolve the issue, you may need to update the server.  Error Code. Contact the system administrator for more information regarding this error message.  Info <br> <br>Bad request or URL not found. <br>Please check your network connection. In case of Layer Upload make sure GeoServer is running and accepting connections. <br>Unknown. A temporal dimension may be added to this Layer. ASCII Text File If the demand series is defined in less time than the ROI analysis, WaterProof will extend the series until the year of analysis repeating the demand value of the last year. If the demand series is defined in a time greater than the ROI analysis, WaterProof will cut the series until the year of analysis. The demand series of the water intakes involved in the case study have been defined in a different time from that indicated for the ROI analysis. CADRG-Global Navigation Chart CADRG-Jet Navigation Chart CADRG-Joint Operations Graphic CADRG-Operational Navigation Chart CADRG-Tactical Pilotage Chart CADRG-Topographic Line Map 100K CADRG-Topographic Line Map 50K CO2 Eq for  Comma Separated Value Controlled Image Base-1 Meter Controlled Image Base-10 Meter Controlled Image Base-5 Meter ERDAS Imagine ESRI Shapefile Edit Metadata Files are ready to be ingested! GIF GeoJSON GeoTIFF Google Earth KML Google Earth KML with a GroundOverlay Google Earth KMZ Please see the InVEST documentation JPEG JPEG2000 Layer files uploaded, configuring in GeoServer Manage Styles Missing a %s file, which is required MrSID-Multi-resolution Seamless Image Database National Imagery Transmission Format PNG Performing Final GeoServer Config Step Performing GeoServer Config Step Remove STORE_UPDATED Style Layer Descriptor The column %1 was renamed to %2 <br/> The file %s is an unsupported file type, please select another file. Unexpected Error Unexpected error! Upload Metadata Upload SLD XML Metadata File You are trying to upload an incomplete set of files or not all mandatory options have been validated.

Please check for errors in the form! You need to specify more information in order to complete your upload Your  Zip Archive Are you sure? c_above (Mg/ha) c_below (Mg/ha) c_dead (Mg/ha) c_soil (Mg/ha) cn_a (dimensionless) cn_b (dimensionless) cn_c (dimensionless) cn_d (dimensionless) cover_rank (dimensionless) crit_len_n (m) crit_len_p (m) Description Discount value Edit eff_n (dimensionless) eff_p (dimensionless) Investment scenario values ​​do not meet minimum budget parameters for activities. Review and adjust the investment scenario values  Please check discount Please complete all required information Please check minimum value The investment scenario value does not meet the minimum budget parameters for the activity. Review and adjust the investment scenario value  please change the name Please check period value must be greater than 10 and less than 100 The value of Implementation Time of Nature-Based Solution (yr) must be less to analysis time period Exchange Rate Field Empty Field problem kc_1 (dimensionless) kc_10 (dimensionless) kc_11 (dimensionless) kc_12 (dimensionless) kc_2 (dimensionless) kc_3 (dimensionless) kc_4 (dimensionless) kc_5 (dimensionless) kc_6 (dimensionless) kc_7 (dimensionless) kc_8 (dimensionless) kc_9 (dimensionless) load_n kg/(ha*year) load_p kg/(ha*year) lucode (dimensionless) lulc_veg (dimensionless) Minimum Value n_exp (g/(ha*year) n_ret (dimensionless) native_veg (dimensionless) p_exp (g/(ha*year) p_ret (dimensionless) portfolios info portfolios objectives proportion_subsurface_n (dimensionless) You won't be able to revert this! Yes, delete it! root_depth (mm) rough_rank (s/m^(1/3)) The system has started the analysis of your case study. This task will take a few minutes so you can close this window and come back later. In addition, the system will send you an email notifying you when the results are available. sed_exp (dimensionless) sed_ret (dimensionless) Study Case exist Below are the biophysical tables that will be used in modeling un inVEST and RIOS. You can edit the values according to the specific knowledge of the supplying basins usle_c (dimensionless) usle_p (dimensionless) 
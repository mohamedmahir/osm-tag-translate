var wikidata = {
  set: function(key, value) {
    if (!key || !value) {return;}

    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    localStorage.setItem(key, value);
  },
  get: function(key) {
    var value = localStorage.getItem(key);

    if (!value) {return;}

    // assume it is an object that has been stringified
    if (value[0] === "{") {
      value = JSON.parse(value);
    }

    return value;
  }
}

osmTagTranslate={};
osmTagTranslate.TotalTranslated =0;
osmTagTranslate.loadWikidata=function(){
	
	this.url="https://query.wikidata.org/sparql?format=json&query=";
	console.log(this.url+encodeURIComponent($("#wdsparql").text()));
	$.getJSON(this.url+encodeURIComponent($("#wdsparql").text()),function(data){
		//$("body").append("<input type='hidden' id='jsondata' value='"+data+"' />");
		wikidata.set('jsonWikiData',data);
		//console.log(JSON.stringify(data));
		//return data;
		}
	);
		
}

osmTagTranslate.getOsmSource=function(){
	url="https://overpass-api.de/api/interpreter?data=";
	console.log(url+encodeURIComponent($('#overpassQuery').text()));
	$.ajax({
			type: "GET" ,
			url: url+encodeURIComponent($('#overpassQuery').text()),
			dataType: "xml" ,
			success: function(xml) {
				osmSource=xml;
				$('#osmSourcetxt').text(getXmlAsString(osmSource));
				//getTranslateAll();
				//console.log(getXmlAsString(osmSource));
			}
		});		
}
	
osmTagTranslate.getTranslateAll=function(){
	//console.log(osmSource);
	//var xmlDoc=$.parseXML(osmSource);
	osmSource=$.parseXML($('#osmSourcetxt').val());
	var $xml =$(osmSource);//$(osmSource);
	var n_w_r = ["node","relation","way"];
	$.each(n_w_r,function(i,j){
	var $node = $xml.find(j);
	$node.each(function(){
	
		$thisnode=$(this);
		//console.log(typeof($(this).find('tag[k="name"]').attr("v")));
		if(typeof($(this).find('tag[k="name:ta"]').attr("v"))==="undefined"){	
			if(typeof($(this).find('tag[k="name"]').attr("v"))=="string"){//name exists
				var en_name=$(this).find('tag[k="name"]').attr('v')
				//console.log(en_name);
				$dest_lang=wikidata.get('jsonWikiData').results;
				index =$dest_lang.bindings.findIndex(function(item, i){
				//nsole.log(Object.keys(item));
					if(!(item==="undefined")){
					return item["source_lang"].value === en_name
					}
				});
				
				if(index >-1){
			
				osmTagTranslate.TotalTranslated++;
					$thisnode.append("<tag k='name:ta' v='"+$dest_lang.bindings[index].dest_lang.value+"' />");
					$thisnode.attr("action","modify");
				}

				
			}
		}
		});
		
		});

	console.log(osmTagTranslate.TotalTranslated);
	
	$('#osmTagTranslated').val(getXmlAsString(osmSource));
}//getTranslateAll
	
	function getXmlAsString(xmlDom){
		return (typeof XMLSerializer!=="undefined") ? (new window.XMLSerializer()).serializeToString(xmlDom) : xmlDom.xml;
	}
		 
osmTagTranslate.getTranslatedText=function(val){
	let index=wikidata.get('jsonWikiData').results.bindings.findIndex(function(item,i)	{
	return item["source_lang"].value === val;
});

if(index>-1)
	return wikidata.get('jsonWikiData').results.bindings[index].dest_lang.value;
else
	return "";

}

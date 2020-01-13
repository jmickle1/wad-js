import "jquery";
import {
    CONST,
    Colormap,
    Endoom,
    Flat,
    Graphic,
    MapData,
    mus2midi,
    Playpal,
    Wad
} from "wad";

import { createAudioPreview } from "./audio";
import { createImagePreview } from "./image";
import { createMIDIPreview } from "./midi";
import { createTextPreview } from "./text";
import { getIcon } from "../index";

function makeUL(array: string[][]) {
    // Create the list element:
    var list = document.createElement("ol");
    list.id = "lumpUL";

    for (var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement("li");

        // Set its contents:
        var span = document.createElement("span");
        span.innerHTML += getIcon(array[i][0]);
        var name = document.createTextNode(" " + array[i][1]);
        span.appendChild(name);
        item.appendChild(span);

        item.id = "item";

        // Add it to the list:
        list.appendChild(item);
    }

    // Finally, return the constructed list:
    return list;
}

export function createLumpList(wad: Wad, lumpnames: string[][]) {
    for (var i = 0; i < wad.lumps.length; i++) {
        lumpnames.push([wad.detectLumpType(i), wad.lumps[i].name]);
    }

    $("#lumpTable").show();
    $("#lumpList").html(makeUL(lumpnames));

    $("#lumpUL").delegate("li", "click", function(e) {
        $("#preview").html("");
        $("#preview").show();
        while (e.target.id != "item") e.target = e.target.parentNode;

        var li = e.target,
            i = 0;

        while (li.previousElementSibling) {
            li = li.previousElementSibling;
            i += 1;
        }

        const lumptype = wad.detectLumpType(i);

        switch (lumptype) {
            case CONST.PNG:
                $("#preview").html("");
                $("#preview").append(createImagePreview(wad.getLump(i)));
                break;
            case CONST.MP3:
            case CONST.MUSIC:
                $("#preview").html("");
                $("#preview").append(createAudioPreview(wad.getLump(i)));
                break;
            case CONST.MUS:
                $("#preview").html("");
                const midi = mus2midi(wad.getLump(i));
                if (midi === false) {
                    throw new Error("Could not convert MUS to MIDI");
                }
                $("#preview").append(createMIDIPreview(midi));
                break;
            case CONST.MIDI:
                $("#preview").html("");
                $("#preview").append(createMIDIPreview(wad.getLump(i)));
                break;
            case CONST.TEXT:
                $("#preview").html("");
                $("#preview").append(createTextPreview(wad.getLumpAsText(i)));
                break;
            case CONST.PLAYPAL:
                const playpal = new Playpal();
                playpal.load(wad.getLump(i));
                $("#preview").html("");
                var preview = document.getElementById("preview");
                if (preview === null) {
                    throw new Error("Can't find preview element");
                }
                preview.appendChild(playpal.toCanvas());
                break;
            case CONST.COLORMAP:
                const colormap = new Colormap();
                colormap.load(wad.getLump(i));
                $("#preview").html("");
                var preview = document.getElementById("preview");
                if (preview === null) {
                    throw new Error("Can't find preview element");
                }
                preview.appendChild(colormap.toCanvas(wad));
                break;
            case CONST.FLAT:
                const flat = new Flat();
                flat.load(wad.getLump(i));
                $("#preview").html("");
                var preview = document.getElementById("preview");
                if (preview === null) {
                    throw new Error("Can't find preview element");
                }
                preview.appendChild(flat.toCanvas(wad));
                break;
            case CONST.GRAPHIC:
                const graphic = new Graphic();
                graphic.load(wad.getLump(i));
                $("#preview").html("");
                var preview = document.getElementById("preview");
                if (preview === null) {
                    throw new Error("Can't find preview element");
                }
                preview.appendChild(graphic.toCanvas(wad));
                break;
            case CONST.ENDOOM:
                const endoom = new Endoom();
                endoom.onLoad = function() {
                    $("#preview").html("");
                    var preview = document.getElementById("preview");
                    if (preview === null) {
                        throw new Error("Can't find preview element");
                    }
                    preview.appendChild(endoom.toCanvas());
                };
                endoom.load(wad.getLump(i));
                $("#preview").html("");

                break;
            case CONST.MAP:
                const map = new MapData();
                map.load(wad, wad.lumps[i].name);
                $("#preview").html("");
                var width =
                    window.innerWidth ||
                    document.documentElement.clientWidth ||
                    document.body.clientWidth;
                var height =
                    window.innerHeight ||
                    document.documentElement.clientHeight ||
                    document.body.clientHeight;
                var preview = document.getElementById("preview");
                if (preview === null) {
                    throw new Error("Can't find preview element");
                }
                var lumplist = $("#lumpList");
                if (lumplist == null) {
                    throw new Error("Can't find lumplist element");
                }
                const lumplistWidth = lumplist.width();
                if (lumplistWidth == null) {
                    throw new Error("Llumplist has no width");
                }
                preview.appendChild(
                    map.toCanvas((width - lumplistWidth) * 0.8, height * 0.8)
                );
                break;
            case CONST.MAPDATA:
                const mapdata = new MapData();
                switch (wad.lumps[i].name) {
                    case "VERTEXES":
                        mapdata.parseVertexes(wad.getLump(i));
                        $("#preview").html(
                            "Total vertexes: " +
                                mapdata.vertexes.length.toString()
                        );
                        break;
                    case "LINEDEFS":
                        mapdata.parseLinedefs(wad.getLump(i));
                        $("#preview").html(
                            "Total linedefs: " +
                                mapdata.linedefs.length.toString()
                        );
                        break;
                    case "SIDEDEFS":
                        mapdata.parseSidedefs(wad.getLump(i));
                        $("#preview").html(
                            "Total sidedefs: " +
                                mapdata.sidedefs.length.toString()
                        );
                        break;
                    case "SECTORS":
                        mapdata.parseSectors(wad.getLump(i));
                        $("#preview").html(
                            "Total sectors: " +
                                mapdata.sectors.length.toString()
                        );
                        break;
                    case "THINGS":
                        mapdata.parseThings(wad.getLump(i));

                        var tht = mapdata.getThingTable();
                        var tab = "";
                        for (var prop in tht) {
                            if (tht.hasOwnProperty(prop)) {
                                tab += mapdata.getDoomThingName(parseInt(prop));
                                tab += "s: " + tht[prop] + "<br>";
                            }
                        }

                        $("#preview").html(
                            "Total things: " +
                                mapdata.things.length.toString() +
                                "<p>" +
                                tab
                        );

                        break;
                    default:
                        $("#preview").html(
                            "Unable to preview " + wad.lumps[i].name + " lumps"
                        );
                        break;
                }
                break;
            case "...":
                $("#preview").html(
                    "Unable to preview this lump, and can't detect it's type<br>"
                );
                var but = document.createElement("button");
                but.onclick = function viewAsText() {
                    $("#preview").html("");
                    createTextPreview(wad.getLumpAsText(i));
                };
                but.innerHTML = "View as text";
                $("#preview").append(but);
                break;
            default:
                $("#preview").html("Unable to preview " + lumptype + " lumps");
                break;
        }
    });
}

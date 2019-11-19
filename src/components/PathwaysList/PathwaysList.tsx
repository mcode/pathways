import React, { FC, ReactNode } from 'react';
import useGetPathwaysService from '../PathwaysService/PathwaysService';
import { Pathway } from 'pathways-objects';

import classes from './PathwaysList.module.scss';

interface Props {
    callback: Function;
}
  

  
const PathwaysList: FC<Props> = (props: Props) => {
    const service = useGetPathwaysService("http://pathways.mitre.org:3002/pathways/");
    function renderList(list:Pathway[]):ReactNode {
        return <div>{list.map((pathway) => {
            return renderElement(pathway);
        })}</div>
    }
    
    function renderElement(pathway:Pathway):ReactNode {
        return (
            <div 
                className={classes['pathway-element']} 
                key = {pathway.name}
                onClick = {()=>{props.callback(pathway)}}
            >
                <div>
                    Name: {pathway.name}
                </div>
                <div>
                    "{pathway.description}"
                </div>
    
            </div>
        )
    }
    return (
        <div>
            {service.status==="loading"?<div>Loading...</div>:service.status==="loaded"?<div>{renderList(service.payload.results)}</div>:<div>ERROR</div>}
        </div>
    );
};

export default PathwaysList;

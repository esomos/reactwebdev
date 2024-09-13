import React, { useState, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'

import "./index.css"
import { Link } from "react-router-dom"

// helper constants
const os = getOS()
export const platform = (os === 'Android' || os === 'iOS')? 'phone' : 'pc'

// helper methods
export function get_element_pos(element, ancker) {
    const rect = element.getBoundingClientRect()
    switch (ancker) {
        case "top":
            return {
                x: rect.x + window.scrollX + rect.width / 2.0,
                y: rect.y + window.scrollY
            }
        case "left":
            return {
                x: rect.x + window.scrollX,
                y: rect.y + window.scrollY + rect.height / 2.0
            }
        case "right":
            return {
                x: rect.x + window.scrollX + rect.width,
                y: rect.y + window.scrollY + rect.height / 2.0
            }
        case "bottom":
            return {
                x: rect.x + window.scrollX + rect.width / 2.0,
                y: rect.y + window.scrollY + rect.height
            }
        default:
            return {
                x: rect.x + window.scrollX,
                y: rect.y + window.scrollY
            }
    }
}
export function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(deepCopy);
    }

    let copy = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deepCopy(obj[key]);
        }
    }
    return copy;
}
// Function to convert HSV to RGB
export function hsvToRgb(h, s, v) {
    let r, g, b

    const i = Math.floor(h / 60)
    const f = h / 60 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)

    switch (i % 6) {
        case 0:
            r = v; g = t; b = p
            break
        case 1:
            r = q; g = v; b = p
            break
        case 2:
            r = p; g = v; b = t
            break
        case 3:
            r = p; g = q; b = v
            break
        case 4:
            r = t; g = p; b = v
            break
        case 5:
            r = v; g = p; b = q
            break
        default:
            break
    }

    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}
// Function to convert RGB to Hex
export function rgbToHex(r, g, b) {
    const toHex = n => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
// Function to generate a random color with given saturation and value
export function getRandomColorWithSV(saturation, value) {
    const randomHue = Math.floor(Math.random() * 360);
    const [r, g, b] = hsvToRgb(randomHue, saturation, value);
    return rgbToHex(r, g, b);
}
export function array_shift_entry(arr, from, to) {
    const temp = arr[from]
    arr.splice(from, 1)
    arr.splice(to, 0, temp)
}
export function getOS() {
    let userAgent = window.navigator.userAgent;
    let platform = window.navigator?.userAgentData?.platform || window.navigator.platform;
    let macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    let windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    let iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    let os = null;

    if (macosPlatforms.includes(platform)) {
        os = 'Mac OS';
    } else if (iosPlatforms.includes(platform)) {
        os = 'iOS';
    } else if (windowsPlatforms.includes(platform)) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    } else if (/Linux/.test(platform)) {
        os = 'Linux';
    }

    return os;
}

export class Container extends React.Component {
    render() {
        return (
            <div style={this.props.style} className='container' >
                {this.props.children}
            </div>
        )
    }
}

export class SubContainer extends React.Component {
    render() {
        return (
            <div className='sub-container' style={this.props.style}>
                {this.props.children}
            </div>
        )
    }
}

export class SmoothAddContainer extends React.Component {
    constructor(props) {
        super(props)
        this.containerRef = React.createRef()
    }

    transition_height() {
        const container = this.containerRef.current
        const newHeight = container.clientHeight
        container.style.height = `${0}px`
        const _ = container.offsetHeight // Trigger a reflow
        container.style.height = `${newHeight}px`
        container.ontransitionend = () => {
            container.style.height = 'auto'
            container.ontransitionend = null
        }
    }

    transition_width(reverse = false) {
        const container = this.containerRef.current
        const newWidth = container.clientWidth
        container.style.width = `${reverse ? newWidth : 0}px`
        const _ = container.offsetWidth // Trigger a reflow
        container.style.width = `${reverse ? 0 : newWidth}px`
        container.ontransitionend = () => {
            if (reverse) {
                container.remove()
            }
            else {
                container.style.width = 'auto'
                container.ontransitionend = null
            }

        }
    }

    componentDidMount() {
        if (platform === 'phone') return
        const container = this.containerRef.current
        if (container) {
            if (this.props.smooth_width) {
                this.transition_width()
            }
            else {
                this.transition_height()
            }
        }
    }

    componentDidUpdate() {
        if (platform === 'phone') return
        const container = this.containerRef.current
        if (container) {
            if (this.props.delete) {
                if (this.props.smooth_width) {
                    this.transition_width(true)
                }
                else {
                    this.transition_height(true)
                }
            }
        }
    }

    render() {
        return (
            <div
                className='smooth-add-container'
                ref={this.containerRef}
                style={this.props.style}
            >
                {this.props.children}
            </div>
        )
    }
}

export class ShrinkContainer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            switch_off: props.switch_off ? true : false,
            sign: props.switch_off ? props.show_sign : props.hide_sign
        }
    }
    render() {
        return (
            // any level of container other than base container must have width 100% in order for overflow to work properly
            <div className="shrink-container">
                <Section>
                    {this.props.disable_button ? null :
                        <Button style={{ width: '100%' }} onClick={(event) => {
                            if (this.state.switch_off) {
                                this.setState({ switch_off: false, sign: this.props.hide_sign })
                            }
                            else {
                                this.setState({ switch_off: true, sign: this.props.show_sign })
                            }
                            if (this.props.onSwitch) {
                                this.props.onSwitch(!this.state.switch_off)
                            }
                        }}> {this.state.sign} </Button>}
                </Section>
                <div
                    style={{
                        ...(this.state.switch_off ? {
                            opacity: 0,
                            position: 'absolute',
                            pointerEvents: 'none'
                        } : null),
                        ...this.props.style,
                    }}
                    className={this.props.className}
                >
                    {this.props.children}
                </div>
            </div>
        )
    }
}

export const SplitContainer = ({ leftComponent, rightComponent, limit }) => {
    const [dividerPosition, setDividerPosition] = useState(50); // Initial position in percentage
    const containerRef = useRef(null);
    const dividerRef = useRef(null)
    const isDragging = useRef(false);

    const startDragging = (e) => {
        isDragging.current = true;
        set_divider_active()
    };

    const stopDragging = (e) => {
        isDragging.current = false;
        set_divider_pasive()
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const newDividerPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        if (newDividerPosition > limit.left && newDividerPosition < (100 - limit.right)) {
            setDividerPosition(newDividerPosition);
        }
    };

    const set_divider_active = () => {
        dividerRef.current.style.backgroundColor = '#999'
        containerRef.current.style.cursor = 'col-resize'
    }
    const set_divider_pasive = () => {
        dividerRef.current.style.backgroundColor = '#cccccc00'
        containerRef.current.style.cursor = 'unset'
    }

    return (
        <div
            className="split-container"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
        >
            <div className="left-pane" style={{ width: `${dividerPosition}%` }}>
                {leftComponent}
            </div>
            <div
                ref={dividerRef}
                className="divider"
                onMouseDown={startDragging}
                onMouseEnter={set_divider_active}
                onMouseLeave={() => { if (!isDragging.current) set_divider_pasive() }}
                style={{ left: `${dividerPosition}%` }}
            />
            <div className="right-pane" style={{ width: `${100 - dividerPosition}%` }}>
                {rightComponent}
            </div>
        </div>
    );
}

export class Section extends React.Component {
    render() {
        return (
            <div className='section' id={this.props.id} ref={this.props.passRef} style={this.props.style}>
                {this.props.children}
            </div>
        )
    }
}

export class SubSection extends React.Component {
    render() {
        return (
            <div className='sub-section' style={this.props.style} ref={this.props.passRef}>
                {this.props.children}
            </div>
        )
    }
}

export class LabeledSection extends React.Component {
    render() {
        return (
            <SubSection>
                {(!this.props.label) ? null : <span style={{ margin: "5px" }}>{this.props.label}:</span>}
                {this.props.children}
            </SubSection>
        )
    }
}

export class Input extends React.Component {
    render() {
        return (
            <LabeledSection label={this.props.label}>
                <input
                    type={this.props.type}
                    value={this.props.value}
                    onChange={this.props.onChange ? this.props.onChange : null}
                    style={this.style}
                />
            </LabeledSection>
        )
    }
}

export class InputText extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            changed: false
        }
        this.session_value = this.props.value
    }
    componentDidUpdate(prev_props) {
        if (prev_props.value !== this.props.value) { // if change in value
            this.setState({ changed: this.props.value !== this.session_value })
            console.log('helo')
        }
    }
    render() {
        return (
            <LabeledSection label={this.props.label}>
                <input
                    className={this.state.changed ? 'input-changed' : null}
                    style={{
                        width: this.props.value.length * 10 + 20,
                        ...this.style
                    }}
                    type='text'
                    value={this.props.value}
                    onChange={(event) => {
                        this.setState({ changed: true })
                        this.props.onChange(event)
                    }}
                />
            </LabeledSection>
        )
    }
}

export class InputColor extends React.Component {
    render() {
        return (
            <LabeledSection>
                <input
                    type='color'
                    value={this.props.value}
                    style={this.style}
                    onChange={this.props.onChange}
                />
            </LabeledSection>
        )
    }
}

export class InputNumber extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            changed: false
        }
        this.session_value = props.value
    }

    componentDidUpdate(prev_props) {
        if (prev_props.value !== this.props.value) { // if change in value
            this.setState({ changed: this.props.value !== this.session_value })
        }
    }

    render() {
        return (
            <LabeledSection label={this.props.label}>
                <div style={{ display: 'flex', columnGap: '4px' }}>
                    <Button onClick={() => {
                        const input_value = this.props.value
                        this.props.onChange({ target: { value: input_value - 1 } })
                    }}>-</Button>
                    <input
                        className={this.state.changed ? 'input-changed' : null}
                        onChange={(event) => {
                            this.props.onChange(event)
                        }}
                        style={
                            {
                                borderRadius: '0px',
                                width: String(this.props.value).length * 15 + 20,
                                ...this.style
                            }
                        }
                        type='number'
                        value={this.props.value ? this.props.value : 0}
                    />
                    <Button onClick={() => {
                        const input_value = this.props.value
                        this.props.onChange({ target: { value: input_value + 1 } })
                    }}>+</Button>
                </div>
            </LabeledSection>
        )
    }
}

export class Button extends React.Component {
    render() {
        return (
            <div
                className={(platform === "pc") ? "button pc-button" : "button phone-button"}
                ref={this.props.sef}
                onClick={this.props.onClick}
                onMouseDown={this.props.onMouseDown}
                onMouseUp={this.props.onMouseUp}
                onMouseMove={this.props.onMouseMove}
                style={this.props.style}
                tooltip={this.props.tooltip}
            >
                {this.props.children}
            </div>
        )
    }
}

export class RearrangeButton extends React.Component {
    render(){
        return (
            <>
                <Button onClick={() => this.props.onRearrange(-1)}>
                    ↑
                </Button>
                <Button onClick={() => this.props.onRearrange(1)}>
                    ↓
                </Button>
            </>
        )
    }
}

export class ButtonLink extends React.Component {
    render() {
        return (
            <Button parent={this.props.parent}>
                <Link to={this.props.to}>
                    {this.props.children}
                </Link>
            </Button>
        )
    }
}

export class HistoGraph extends React.Component {
    static Bar = (props) => {
        const PLOTS = props.bar.plots
        return (
            /* this div stores plots, name and height number of bar */
            <SmoothAddContainer key={props.key} smooth_width={true}>
                <div className='histo-bar'>
                    <span>{props.bar.height}</span>
                    {/* this div stores plots of bar*/}
                    <div className='histo-bar-plots' style={{ backgroundColor: props.bar.color }}>
                        {PLOTS.map((val, i) => {
                            return <div key={i} className='histo-bar-plot' style={{
                                backgroundColor: val.color,
                                height: `${val.percentage}%`,
                            }}>
                                <span>{val.percentage}%</span>
                                <span>{val.name}</span>
                            </div>
                        })}
                    </div>
                    <span>{props.bar.name}</span>
                </div>
            </SmoothAddContainer>
        )
    }
    render() {
        return (
            <SubContainer>
                <ShrinkContainer
                    show_sign="Show Graph"
                    hide_sign="Hide Graph"
                    className="histo-graph"
                    disable_button={this.props.disable_button}
                >
                    {
                        !this.props.graph.length ? 'nothing to show!' :
                            this.props.graph.map((val, i) => (
                                HistoGraph.Bar({ key: val.key, bar: val })
                            ))
                    }
                </ShrinkContainer>
            </SubContainer>
        )
    }
}

export const DraggableItem = ({ index, children, className, drop_hover, onDrop, item_key, item_type, drag_ref }) => {
    const ref = useRef(null)
    const [{ isDragging }, drag, preview] = useDrag({
        type: item_type ? item_type : 'ITEM',
        item: { index, item_key },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        })
    })

    const [, drop] = useDrop({
        accept: item_type ? item_type : 'ITEM',
        hover: drop_hover,
        drop: onDrop
    })

    drag(drag_ref ? drag_ref : ref)
    drop(ref)
    preview(ref)
    return (
        <div className={className} ref={ref} style={{ opacity: isDragging ? 0 : 1 }}>
            {children}
        </div>
    )
}

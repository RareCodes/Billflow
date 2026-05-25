import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Pencil
} from 'lucide-react'

import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    name:'',
    email:'',
    phone:'',
    address:''
  })

  const navigate = useNavigate()

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    const {
      data:{user}
    } = await supabase.auth.getUser()

    if(!user){
      navigate('/auth')
      return
    }

    const {data} = await supabase
      .from('clients')
      .select('*')
      .eq('user_id',user.id)
      .order('created_at',{
        ascending:false
      })

    setClients(data || [])
    setLoading(false)
  }

  const saveClient = async () => {
    if(!form.name.trim()){
      alert('Client name is required')
      return
    }

    setSaving(true)

    const {
      data:{user}
    } = await supabase.auth.getUser()

    if(editingId){

      const {data,error} = await supabase
        .from('clients')
        .update(form)
        .eq('id',editingId)
        .select()
        .single()

      if(!error){

        setClients(prev =>
          prev.map(client =>
            client.id === editingId
              ? data
              : client
          )
        )

      }

    } else {

      const {data,error} = await supabase
        .from('clients')
        .insert({
          ...form,
          user_id:user.id
        })
        .select()
        .single()

      if(!error){
        setClients(prev => [
          data,
          ...prev
        ])
      }

    }

    setForm({
      name:'',
      email:'',
      phone:'',
      address:''
    })

    setEditingId(null)
    setShowForm(false)
    setSaving(false)
  }

  const editClient = (client) => {

    setForm({
      name:client.name || '',
      email:client.email || '',
      phone:client.phone || '',
      address:client.address || ''
    })

    setEditingId(client.id)

    setShowForm(true)

    window.scrollTo({
      top:0,
      behavior:'smooth'
    })

  }

  const deleteClient = async(id)=>{
    if(!confirm('Delete this client?')) return

    await supabase
      .from('clients')
      .delete()
      .eq('id',id)

    setClients(prev =>
      prev.filter(c=>c.id!==id)
    )
  }

  const inputCls =
    "w-full h-9 px-3 text-sm border border-[#EDE9FE] rounded-lg outline-none focus:border-[#6D28D9] transition-all"

  return (
    <AppLayout>

      <div className="flex items-center justify-between mb-6 mt-8 lg:mt-0">

        <div>
          <h1
          className="text-xl font-bold text-ink"
          style={{
            fontFamily:'Sora,sans-serif'
          }}>
            Clients
          </h1>

          <p className="text-sm text-ink-secondary mt-0.5">
            {clients.length} saved clients
          </p>
        </div>

        <button
        onClick={()=>{
          setEditingId(null)

          setForm({
            name:'',
            email:'',
            phone:'',
            address:''
          })

          setShowForm(!showForm)
        }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{
          background:'#6D28D9'
        }}>

          <Plus size={16}/>
          Add Client

        </button>

      </div>


      {showForm && (

        <div className="bg-white border border-[#6D28D9] rounded-xl p-6 mb-6">

          <h2 className="font-semibold text-ink mb-4 text-sm">
            {editingId ? 'Edit Client' : 'New Client'}
          </h2>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

            <div>

              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">
                Name *
              </label>

              <input
              value={form.name}
              onChange={e=>
                setForm({
                  ...form,
                  name:e.target.value
                })
              }
              placeholder="Client or company name"
              className={inputCls}
              />

            </div>

            <div>

              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">
                Email
              </label>

              <input
              type="email"
              value={form.email}
              onChange={e=>
                setForm({
                  ...form,
                  email:e.target.value
                })
              }
              placeholder="client@example.com"
              className={inputCls}
              />

            </div>


            <div>

              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">
                Phone
              </label>

              <input
              value={form.phone}
              onChange={e=>
                setForm({
                  ...form,
                  phone:e.target.value
                })
              }
              placeholder="+234..."
              className={inputCls}
              />

            </div>


            <div>

              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">
                Address
              </label>

              <input
              value={form.address}
              onChange={e=>
                setForm({
                  ...form,
                  address:e.target.value
                })
              }
              placeholder="Client address"
              className={inputCls}
              />

            </div>

          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            <button
            onClick={saveClient}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white w-full sm:w-[200px]"
            style={{
              background:'#6D28D9'
            }}>

              {saving
                ? 'Saving...'
                : editingId
                ? 'Update Client'
                : 'Save Client'
              }

            </button>


            <button
            onClick={()=>{
              setShowForm(false)
              setEditingId(null)
            }}
            className="px-4 py-2 border rounded-lg text-sm font-medium text-ink-secondary w-full sm:w-[200px]">

              Cancel

            </button>

          </div>

        </div>

      )}


      {loading ? (

        <div className="py-16 text-center">
          Loading clients...
        </div>

      ) : clients.length===0 ? (

        <div className="bg-white border border-[#EDE9FE] rounded-xl py-16 text-center">

          <Users
          size={36}
          className="mx-auto text-ink-muted mb-3"/>

          <p className="font-semibold text-sm">
            No clients yet
          </p>

        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {clients.map(client=>(

            <div
            key={client.id}
            className="
            bg-white
            border
            border-[#EDE9FE]
            rounded-xl
            p-5
            hover:border-[#6D28D930]
            hover:shadow-sm
            transition-all
            group">

              <div className="flex items-start justify-between mb-3">

                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">

                  <span
                  className="text-sm font-bold"
                  style={{
                    color:'#6D28D9'
                  }}>

                    {client.name[0]?.toUpperCase()}

                  </span>

                </div>


                <div className="flex items-center gap-4">

                  <button
                  onClick={()=>editClient(client)}
                  className="px-4 py-2 flex justify-center items-center text-[#0f1117] gap-2 rounded-lg hover:bg-[#F3F0FF] text-ink-muted hover:text-[#6D28D9]">

                    <Pencil size={13}/> Edit

                  </button>


                  <button
                  onClick={()=>deleteClient(client.id)}
                  className="px-4 py-2 flex justify-center items-center gap-2 text-red-600 rounded-lg hover:bg-red-600 text-ink-muted hover:text-white">

                    <Trash2 size={13}/>Delete

                  </button>

                </div>

              </div>


              <p className="font-semibold text-sm">
                {client.name}
              </p>

              {client.email && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Mail size={11}/>
                  <p className="text-xs truncate">
                    {client.email}
                  </p>
                </div>
              )}

              {client.phone && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Phone size={11}/>
                  <p className="text-xs">
                    {client.phone}
                  </p>
                </div>
              )}

              {client.address && (
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={11}/>
                  <p className="text-xs truncate">
                    {client.address}
                  </p>
                </div>
              )}

            </div>

          ))}

        </div>

      )}

    </AppLayout>
  )
}
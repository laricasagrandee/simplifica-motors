export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          cliente_id: string | null
          criado_em: string | null
          data_hora: string
          descricao: string
          duracao_minutos: number | null
          id: string
          mecanico_id: string | null
          observacoes: string | null
          os_id: string | null
          status: string | null
          tenant_id: string | null
          veiculo_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          criado_em?: string | null
          data_hora: string
          descricao: string
          duracao_minutos?: number | null
          id?: string
          mecanico_id?: string | null
          observacoes?: string | null
          os_id?: string | null
          status?: string | null
          tenant_id?: string | null
          veiculo_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          criado_em?: string | null
          data_hora?: string
          descricao?: string
          duracao_minutos?: number | null
          id?: string
          mecanico_id?: string | null
          observacoes?: string | null
          os_id?: string | null
          status?: string | null
          tenant_id?: string | null
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_mecanico_id_fkey"
            columns: ["mecanico_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          acao: string
          criado_em: string | null
          dados_antes: Json | null
          dados_depois: Json | null
          id: string
          ip: string | null
          registro_id: string | null
          tabela: string
          user_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string | null
          dados_antes?: Json | null
          dados_depois?: Json | null
          id?: string
          ip?: string | null
          registro_id?: string | null
          tabela: string
          user_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string | null
          dados_antes?: Json | null
          dados_depois?: Json | null
          id?: string
          ip?: string | null
          registro_id?: string | null
          tabela?: string
          user_id?: string | null
        }
        Relationships: []
      }
      caixa: {
        Row: {
          aberto_em: string | null
          aberto_por: string | null
          data: string
          fechado_em: string | null
          fechado_por: string | null
          id: string
          observacoes: string | null
          saldo_abertura: number | null
          saldo_fechamento: number | null
          status: string | null
          tenant_id: string | null
          total_entradas: number | null
          total_saidas: number | null
        }
        Insert: {
          aberto_em?: string | null
          aberto_por?: string | null
          data: string
          fechado_em?: string | null
          fechado_por?: string | null
          id?: string
          observacoes?: string | null
          saldo_abertura?: number | null
          saldo_fechamento?: number | null
          status?: string | null
          tenant_id?: string | null
          total_entradas?: number | null
          total_saidas?: number | null
        }
        Update: {
          aberto_em?: string | null
          aberto_por?: string | null
          data?: string
          fechado_em?: string | null
          fechado_por?: string | null
          id?: string
          observacoes?: string | null
          saldo_abertura?: number | null
          saldo_fechamento?: number | null
          status?: string | null
          tenant_id?: string | null
          total_entradas?: number | null
          total_saidas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "caixa_aberto_por_fkey"
            columns: ["aberto_por"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_fechado_por_fkey"
            columns: ["fechado_por"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          atualizado_em: string | null
          cpf_cnpj: string | null
          criado_em: string | null
          data_nascimento: string | null
          email: string | null
          endereco_bairro: string | null
          endereco_cep: string | null
          endereco_cidade: string | null
          endereco_estado: string | null
          endereco_numero: string | null
          endereco_rua: string | null
          id: string
          nome: string
          telefone: string | null
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          cpf_cnpj?: string | null
          criado_em?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_estado?: string | null
          endereco_numero?: string | null
          endereco_rua?: string | null
          id?: string
          nome: string
          telefone?: string | null
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          cpf_cnpj?: string | null
          criado_em?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_estado?: string | null
          endereco_numero?: string | null
          endereco_rua?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          aliquota_imposto: number | null
          atualizado_em: string | null
          cnpj: string | null
          data_vencimento_plano: string | null
          dias_tolerancia: number | null
          email: string | null
          endereco_completo: string | null
          formato_impressao: string | null
          id: string
          ie: string | null
          local_ip: string | null
          logo_url: string | null
          machine_name: string | null
          max_funcionarios: number | null
          nome_fantasia: string | null
          plano: string | null
          plano_ativo: boolean | null
          razao_social: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          taxa_cartao_credito: number | null
          taxa_cartao_credito_parcelado: number | null
          taxa_cartao_debito: number | null
          taxas_parcelamento: Json | null
          telefone: string | null
        }
        Insert: {
          aliquota_imposto?: number | null
          atualizado_em?: string | null
          cnpj?: string | null
          data_vencimento_plano?: string | null
          dias_tolerancia?: number | null
          email?: string | null
          endereco_completo?: string | null
          formato_impressao?: string | null
          id?: string
          ie?: string | null
          local_ip?: string | null
          logo_url?: string | null
          machine_name?: string | null
          max_funcionarios?: number | null
          nome_fantasia?: string | null
          plano?: string | null
          plano_ativo?: boolean | null
          razao_social?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          taxa_cartao_credito?: number | null
          taxa_cartao_credito_parcelado?: number | null
          taxa_cartao_debito?: number | null
          taxas_parcelamento?: Json | null
          telefone?: string | null
        }
        Update: {
          aliquota_imposto?: number | null
          atualizado_em?: string | null
          cnpj?: string | null
          data_vencimento_plano?: string | null
          dias_tolerancia?: number | null
          email?: string | null
          endereco_completo?: string | null
          formato_impressao?: string | null
          id?: string
          ie?: string | null
          local_ip?: string | null
          logo_url?: string | null
          machine_name?: string | null
          max_funcionarios?: number | null
          nome_fantasia?: string | null
          plano?: string | null
          plano_ativo?: boolean | null
          razao_social?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          taxa_cartao_credito?: number | null
          taxa_cartao_credito_parcelado?: number | null
          taxa_cartao_debito?: number | null
          taxas_parcelamento?: Json | null
          telefone?: string | null
        }
        Relationships: []
      }
      device_fingerprints: {
        Row: {
          created_at: string
          device_type: string
          email: string | null
          fingerprint: string
          id: string
          last_seen_at: string
          machine_name: string | null
          tenant_id: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string
          email?: string | null
          fingerprint: string
          id?: string
          last_seen_at?: string
          machine_name?: string | null
          tenant_id?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string
          email?: string | null
          fingerprint?: string
          id?: string
          last_seen_at?: string
          machine_name?: string | null
          tenant_id?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_fingerprints_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_movimentacoes: {
        Row: {
          criado_em: string | null
          criado_por: string | null
          id: string
          motivo: string
          observacao: string | null
          peca_id: string
          preco_unitario: number | null
          quantidade: number
          referencia_id: string | null
          tenant_id: string | null
          tipo: string
        }
        Insert: {
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          motivo: string
          observacao?: string | null
          peca_id: string
          preco_unitario?: number | null
          quantidade: number
          referencia_id?: string | null
          tenant_id?: string | null
          tipo: string
        }
        Update: {
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          motivo?: string
          observacao?: string | null
          peca_id?: string
          preco_unitario?: number | null
          quantidade?: number
          referencia_id?: string | null
          tenant_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_movimentacoes_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_movimentacoes_peca_id_fkey"
            columns: ["peca_id"]
            isOneToOne: false
            referencedRelation: "pecas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_movimentacoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          cargo: string
          comissao_percentual: number | null
          criado_em: string | null
          email: string | null
          id: string
          nome: string
          salario: number | null
          telefone: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cargo: string
          comissao_percentual?: number | null
          criado_em?: string | null
          email?: string | null
          id?: string
          nome: string
          salario?: number | null
          telefone: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cargo?: string
          comissao_percentual?: number | null
          criado_em?: string | null
          email?: string | null
          id?: string
          nome?: string
          salario?: number | null
          telefone?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_itens: {
        Row: {
          contado_em: string | null
          diferenca: number | null
          estoque_contado: number | null
          estoque_sistema: number
          id: string
          inventario_id: string
          observacao: string | null
          peca_id: string
          tenant_id: string | null
        }
        Insert: {
          contado_em?: string | null
          diferenca?: number | null
          estoque_contado?: number | null
          estoque_sistema: number
          id?: string
          inventario_id: string
          observacao?: string | null
          peca_id: string
          tenant_id?: string | null
        }
        Update: {
          contado_em?: string | null
          diferenca?: number | null
          estoque_contado?: number | null
          estoque_sistema?: number
          id?: string
          inventario_id?: string
          observacao?: string | null
          peca_id?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_itens_inventario_id_fkey"
            columns: ["inventario_id"]
            isOneToOne: false
            referencedRelation: "inventarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_itens_peca_id_fkey"
            columns: ["peca_id"]
            isOneToOne: false
            referencedRelation: "pecas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_itens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      inventarios: {
        Row: {
          criado_em: string | null
          criado_por: string | null
          data: string | null
          finalizado_em: string | null
          id: string
          observacoes: string | null
          status: string | null
          tenant_id: string | null
        }
        Insert: {
          criado_em?: string | null
          criado_por?: string | null
          data?: string | null
          finalizado_em?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          tenant_id?: string | null
        }
        Update: {
          criado_em?: string | null
          criado_por?: string | null
          data?: string | null
          finalizado_em?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventarios_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventarios_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_mecanico: {
        Row: {
          ano: number
          criado_em: string | null
          funcionario_id: string
          id: string
          mes: number
          meta_faturamento: number | null
          meta_os: number | null
          tenant_id: string | null
        }
        Insert: {
          ano: number
          criado_em?: string | null
          funcionario_id: string
          id?: string
          mes: number
          meta_faturamento?: number | null
          meta_os?: number | null
          tenant_id?: string | null
        }
        Update: {
          ano?: number
          criado_em?: string | null
          funcionario_id?: string
          id?: string
          mes?: number
          meta_faturamento?: number | null
          meta_os?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metas_mecanico_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metas_mecanico_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      motos: {
        Row: {
          ano: number | null
          cliente_id: string
          cor: string | null
          criado_em: string | null
          id: string
          marca: string | null
          modelo: string | null
          observacoes: string | null
          placa: string | null
          quilometragem: number | null
          tenant_id: string | null
        }
        Insert: {
          ano?: number | null
          cliente_id: string
          cor?: string | null
          criado_em?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          placa?: string | null
          quilometragem?: number | null
          tenant_id?: string | null
        }
        Update: {
          ano?: number | null
          cliente_id?: string
          cor?: string | null
          criado_em?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          placa?: string | null
          quilometragem?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "motos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "motos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes: {
        Row: {
          categoria: string
          criado_por: string | null
          data: string | null
          data_vencimento: string | null
          descricao: string
          forma_pagamento: string | null
          id: string
          os_id: string | null
          pago: boolean | null
          parcela_numero: number | null
          tenant_id: string | null
          tipo: string
          total_parcelas: number | null
          valor: number
          venda_pdv_id: string | null
        }
        Insert: {
          categoria: string
          criado_por?: string | null
          data?: string | null
          data_vencimento?: string | null
          descricao: string
          forma_pagamento?: string | null
          id?: string
          os_id?: string | null
          pago?: boolean | null
          parcela_numero?: number | null
          tenant_id?: string | null
          tipo: string
          total_parcelas?: number | null
          valor: number
          venda_pdv_id?: string | null
        }
        Update: {
          categoria?: string
          criado_por?: string | null
          data?: string | null
          data_vencimento?: string | null
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          os_id?: string | null
          pago?: boolean | null
          parcela_numero?: number | null
          tenant_id?: string | null
          tipo?: string
          total_parcelas?: number | null
          valor?: number
          venda_pdv_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_venda_pdv_id_fkey"
            columns: ["venda_pdv_id"]
            isOneToOne: false
            referencedRelation: "vendas_pdv"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais: {
        Row: {
          destinatario_cpf_cnpj: string | null
          destinatario_nome: string | null
          emitente_cnpj: string | null
          emitente_razao: string | null
          emitida_em: string | null
          id: string
          numero: number
          os_id: string | null
          pdf_url: string | null
          serie: string | null
          tenant_id: string | null
          tipo: string
          valor: number
          venda_pdv_id: string | null
        }
        Insert: {
          destinatario_cpf_cnpj?: string | null
          destinatario_nome?: string | null
          emitente_cnpj?: string | null
          emitente_razao?: string | null
          emitida_em?: string | null
          id?: string
          numero?: number
          os_id?: string | null
          pdf_url?: string | null
          serie?: string | null
          tenant_id?: string | null
          tipo: string
          valor: number
          venda_pdv_id?: string | null
        }
        Update: {
          destinatario_cpf_cnpj?: string | null
          destinatario_nome?: string | null
          emitente_cnpj?: string | null
          emitente_razao?: string | null
          emitida_em?: string | null
          id?: string
          numero?: number
          os_id?: string | null
          pdf_url?: string | null
          serie?: string | null
          tenant_id?: string | null
          tipo?: string
          valor?: number
          venda_pdv_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_venda_pdv_id_fkey"
            columns: ["venda_pdv_id"]
            isOneToOne: false
            referencedRelation: "vendas_pdv"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          assinatura_cliente: string | null
          atualizado_em: string | null
          checklist: Json | null
          cliente_id: string
          criado_em: string | null
          custo_pecas: number | null
          data_abertura: string | null
          data_aprovacao: string | null
          data_conclusao: string | null
          data_entrega: string | null
          desconto: number | null
          diagnostico: string | null
          forma_pagamento: string | null
          garantia_ate: string | null
          garantia_dias: number | null
          id: string
          lucro_bruto: number | null
          mecanico_id: string | null
          motivo_recusa: string | null
          moto_id: string
          numero: number
          observacoes: string | null
          parcelas: number | null
          previsao_entrega: string | null
          problema_relatado: string | null
          status: string
          tenant_id: string | null
          valor_mao_obra: number | null
          valor_orcamento_recusado: number | null
          valor_pecas: number | null
          valor_total: number | null
        }
        Insert: {
          assinatura_cliente?: string | null
          atualizado_em?: string | null
          checklist?: Json | null
          cliente_id: string
          criado_em?: string | null
          custo_pecas?: number | null
          data_abertura?: string | null
          data_aprovacao?: string | null
          data_conclusao?: string | null
          data_entrega?: string | null
          desconto?: number | null
          diagnostico?: string | null
          forma_pagamento?: string | null
          garantia_ate?: string | null
          garantia_dias?: number | null
          id?: string
          lucro_bruto?: number | null
          mecanico_id?: string | null
          motivo_recusa?: string | null
          moto_id: string
          numero?: number
          observacoes?: string | null
          parcelas?: number | null
          previsao_entrega?: string | null
          problema_relatado?: string | null
          status?: string
          tenant_id?: string | null
          valor_mao_obra?: number | null
          valor_orcamento_recusado?: number | null
          valor_pecas?: number | null
          valor_total?: number | null
        }
        Update: {
          assinatura_cliente?: string | null
          atualizado_em?: string | null
          checklist?: Json | null
          cliente_id?: string
          criado_em?: string | null
          custo_pecas?: number | null
          data_abertura?: string | null
          data_aprovacao?: string | null
          data_conclusao?: string | null
          data_entrega?: string | null
          desconto?: number | null
          diagnostico?: string | null
          forma_pagamento?: string | null
          garantia_ate?: string | null
          garantia_dias?: number | null
          id?: string
          lucro_bruto?: number | null
          mecanico_id?: string | null
          motivo_recusa?: string | null
          moto_id?: string
          numero?: number
          observacoes?: string | null
          parcelas?: number | null
          previsao_entrega?: string | null
          problema_relatado?: string | null
          status?: string
          tenant_id?: string | null
          valor_mao_obra?: number | null
          valor_orcamento_recusado?: number | null
          valor_pecas?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_mecanico_id_fkey"
            columns: ["mecanico_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_moto_id_fkey"
            columns: ["moto_id"]
            isOneToOne: false
            referencedRelation: "motos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      os_fotos: {
        Row: {
          categoria: string | null
          criado_em: string | null
          descricao: string | null
          id: string
          os_id: string
          tenant_id: string | null
          tipo: string
          url: string
        }
        Insert: {
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          os_id: string
          tenant_id?: string | null
          tipo: string
          url: string
        }
        Update: {
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          os_id?: string
          tenant_id?: string | null
          tipo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "os_fotos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_fotos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      os_itens: {
        Row: {
          criado_em: string | null
          custo_total: number | null
          custo_unitario: number | null
          descricao: string
          id: string
          os_id: string
          peca_id: string | null
          quantidade: number
          tenant_id: string | null
          tipo: string
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          criado_em?: string | null
          custo_total?: number | null
          custo_unitario?: number | null
          descricao: string
          id?: string
          os_id: string
          peca_id?: string | null
          quantidade?: number
          tenant_id?: string | null
          tipo: string
          valor_total: number
          valor_unitario: number
        }
        Update: {
          criado_em?: string | null
          custo_total?: number | null
          custo_unitario?: number | null
          descricao?: string
          id?: string
          os_id?: string
          peca_id?: string | null
          quantidade?: number
          tenant_id?: string | null
          tipo?: string
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "os_itens_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_peca_id_fkey"
            columns: ["peca_id"]
            isOneToOne: false
            referencedRelation: "pecas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      os_pagamentos: {
        Row: {
          criado_em: string | null
          forma_pagamento: string
          id: string
          observacao: string | null
          os_id: string
          parcelas: number | null
          tenant_id: string | null
          troco: number | null
          valor: number
          valor_recebido: number | null
        }
        Insert: {
          criado_em?: string | null
          forma_pagamento: string
          id?: string
          observacao?: string | null
          os_id: string
          parcelas?: number | null
          tenant_id?: string | null
          troco?: number | null
          valor: number
          valor_recebido?: number | null
        }
        Update: {
          criado_em?: string | null
          forma_pagamento?: string
          id?: string
          observacao?: string | null
          os_id?: string
          parcelas?: number | null
          tenant_id?: string | null
          troco?: number | null
          valor?: number
          valor_recebido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "os_pagamentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_pagamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      os_tempo_servico: {
        Row: {
          criado_em: string | null
          duracao_minutos: number | null
          fim: string | null
          id: string
          inicio: string
          mecanico_id: string | null
          os_id: string | null
          pausado: boolean | null
          tenant_id: string | null
        }
        Insert: {
          criado_em?: string | null
          duracao_minutos?: number | null
          fim?: string | null
          id?: string
          inicio: string
          mecanico_id?: string | null
          os_id?: string | null
          pausado?: boolean | null
          tenant_id?: string | null
        }
        Update: {
          criado_em?: string | null
          duracao_minutos?: number | null
          fim?: string | null
          id?: string
          inicio?: string
          mecanico_id?: string | null
          os_id?: string | null
          pausado?: boolean | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "os_tempo_servico_mecanico_id_fkey"
            columns: ["mecanico_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_tempo_servico_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_tempo_servico_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      pc_ips: {
        Row: {
          atualizado_em: string | null
          email: string
          ip: string
        }
        Insert: {
          atualizado_em?: string | null
          email: string
          ip: string
        }
        Update: {
          atualizado_em?: string | null
          email?: string
          ip?: string
        }
        Relationships: []
      }
      pecas: {
        Row: {
          atualizado_em: string | null
          categoria: string
          codigo: string | null
          codigo_barras: string | null
          criado_em: string | null
          estoque_atual: number | null
          estoque_minimo: number | null
          id: string
          marca: string | null
          nome: string
          preco_custo: number
          preco_venda: number
          qr_code_url: string | null
          tenant_id: string | null
          unidade: string | null
        }
        Insert: {
          atualizado_em?: string | null
          categoria: string
          codigo?: string | null
          codigo_barras?: string | null
          criado_em?: string | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          id?: string
          marca?: string | null
          nome: string
          preco_custo?: number
          preco_venda?: number
          qr_code_url?: string | null
          tenant_id?: string | null
          unidade?: string | null
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string
          codigo?: string | null
          codigo_barras?: string | null
          criado_em?: string | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          id?: string
          marca?: string | null
          nome?: string
          preco_custo?: number
          preco_venda?: number
          qr_code_url?: string | null
          tenant_id?: string | null
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pecas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_precos: {
        Row: {
          ativo: boolean
          atualizado_em: string | null
          criado_em: string | null
          id: string
          intervalo: string
          max_funcionarios: number
          slug: string
          stripe_price_id: string | null
          valor_centavos: number
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          intervalo: string
          max_funcionarios?: number
          slug: string
          stripe_price_id?: string | null
          valor_centavos?: number
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          intervalo?: string
          max_funcionarios?: number
          slug?: string
          stripe_price_id?: string | null
          valor_centavos?: number
        }
        Relationships: []
      }
      vendas_pdv: {
        Row: {
          cliente_id: string | null
          criado_em: string | null
          criado_por: string | null
          custo_total: number
          desconto: number | null
          forma_pagamento: string
          id: string
          lucro_bruto: number
          numero: number
          observacoes: string | null
          parcelas: number | null
          tenant_id: string | null
          troco: number | null
          valor_recebido: number | null
          valor_total: number
        }
        Insert: {
          cliente_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          custo_total?: number
          desconto?: number | null
          forma_pagamento: string
          id?: string
          lucro_bruto?: number
          numero?: number
          observacoes?: string | null
          parcelas?: number | null
          tenant_id?: string | null
          troco?: number | null
          valor_recebido?: number | null
          valor_total?: number
        }
        Update: {
          cliente_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          custo_total?: number
          desconto?: number | null
          forma_pagamento?: string
          id?: string
          lucro_bruto?: number
          numero?: number
          observacoes?: string | null
          parcelas?: number | null
          tenant_id?: string | null
          troco?: number | null
          valor_recebido?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_pdv_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_pdv_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_pdv_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas_pdv_itens: {
        Row: {
          criado_em: string | null
          custo_total: number | null
          custo_unitario: number | null
          descricao: string
          id: string
          peca_id: string
          quantidade: number
          tenant_id: string | null
          valor_total: number
          valor_unitario: number
          venda_id: string
        }
        Insert: {
          criado_em?: string | null
          custo_total?: number | null
          custo_unitario?: number | null
          descricao: string
          id?: string
          peca_id: string
          quantidade?: number
          tenant_id?: string | null
          valor_total: number
          valor_unitario: number
          venda_id: string
        }
        Update: {
          criado_em?: string | null
          custo_total?: number | null
          custo_unitario?: number | null
          descricao?: string
          id?: string
          peca_id?: string
          quantidade?: number
          tenant_id?: string | null
          valor_total?: number
          valor_unitario?: number
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendas_pdv_itens_peca_id_fkey"
            columns: ["peca_id"]
            isOneToOne: false
            referencedRelation: "pecas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_pdv_itens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "configuracoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_pdv_itens_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas_pdv"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
